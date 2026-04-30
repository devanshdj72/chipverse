import { prisma } from "../config/prisma";
import logger from "../utils/logger";

const pdfParse = require("pdf-parse");

// ── VLSI Domain keyword map (matches ChipVerse DOMAIN_LIST exactly) ───────────
const DOMAIN_ROLES: Record<string, { roles: string[]; keywords: string[]; color: string }> = {
  "RTL Design": {
    color: "#00f5ff",
    roles: ["RTL Design Engineer", "Digital Design Engineer", "ASIC Design Engineer"],
    keywords: [
      "Verilog", "SystemVerilog", "RTL", "ASIC", "FSM", "Testbench",
      "always block", "module", "wire", "reg", "assign", "posedge",
      "clock", "reset", "synthesis", "netlist", "flip-flop", "counter",
      "UART", "SPI", "I2C", "AXI", "FIFO", "pipeline", "datapath",
      "Synopsys", "Cadence", "Quartus", "Vivado", "Yosys",
      "SDC", "timing constraints", "RISC-V", "ALU", "DMA",
    ],
  },
  "Verification": {
    color: "#a855f7",
    roles: ["Verification Engineer", "DV Engineer", "SoC Verification Engineer"],
    keywords: [
      "UVM", "SystemVerilog", "testbench", "assertions", "SVA",
      "functional coverage", "code coverage", "covergroup", "coverpoint",
      "constrained random", "scoreboard", "monitor", "driver", "sequencer",
      "agent", "environment", "VIP", "regression", "simulation",
      "Cadence", "Synopsys VCS", "Mentor QuestaSim", "xcelium",
      "AXI verification", "protocol verification", "debugging", "waveform",
      "factory", "config_db", "sequence", "mailbox", "semaphore",
    ],
  },
  "Physical Design": {
    color: "#3b82f6",
    roles: ["Physical Design Engineer", "Backend Engineer", "PnR Engineer"],
    keywords: [
      "Physical Design", "floorplanning", "placement", "routing", "CTS",
      "clock tree synthesis", "STA", "static timing analysis", "timing closure",
      "DRC", "LVS", "IR drop", "EM", "power planning", "power grid",
      "Innovus", "ICC2", "Synopsys DC", "PrimeTime", "Calibre",
      "LEF", "DEF", "Liberty", "SDC", "MMMC", "OCV",
      "GDSII", "tapeout", "signoff", "congestion", "utilization",
      "setup time", "hold time", "slack", "critical path", "ECO",
    ],
  },
  "Analog IC Design": {
    color: "#f59e0b",
    roles: ["Analog IC Design Engineer", "Mixed Signal Engineer", "Circuit Design Engineer"],
    keywords: [
      "Analog", "CMOS", "op-amp", "operational amplifier", "differential pair",
      "current mirror", "bandgap", "LDO", "PLL", "VCO", "ADC", "DAC",
      "MOSFET", "transistor", "gm", "small signal", "frequency response",
      "phase margin", "gain bandwidth", "slew rate", "noise", "mismatch",
      "Cadence Virtuoso", "SPICE", "Spectre", "HSPICE", "ADE",
      "layout", "parasitic", "DRC", "LVS", "mixed-signal",
      "SAR ADC", "Flash ADC", "charge pump", "loop filter", "jitter",
    ],
  },
  "FPGA Design": {
    color: "#10b981",
    roles: ["FPGA Design Engineer", "FPGA Developer", "Hardware Engineer"],
    keywords: [
      "FPGA", "Verilog", "VHDL", "SystemVerilog", "Vivado", "Quartus",
      "LUT", "flip-flop", "BRAM", "DSP slice", "PLL", "MMCM",
      "bitstream", "synthesis", "implementation", "timing constraints",
      "XDC", "Zynq", "AXI", "IP core", "MicroBlaze",
      "Xilinx", "AMD", "Intel PSG", "Lattice", "Altera",
      "reconfigurable", "SERDES", "clock domain crossing", "CDC",
      "HDL", "RTL", "testbench", "simulation", "ModelSim",
    ],
  },
  "DFT": {
    color: "#ec4899",
    roles: ["DFT Engineer", "Test Engineer", "Silicon Test Engineer"],
    keywords: [
      "DFT", "scan chain", "ATPG", "test patterns", "stuck-at fault",
      "transition fault", "scan insertion", "scan enable", "JTAG",
      "boundary scan", "MBIST", "memory test", "BIST", "IEEE 1149",
      "fault coverage", "test compression", "EDT", "Tessent",
      "Synopsys DFT compiler", "diagnosis", "silicon validation",
      "yield", "manufacturing test", "TAP controller",
      "controllability", "observability", "redundancy",
    ],
  },
  "Embedded Systems": {
    color: "#f97316",
    roles: ["Embedded Systems Engineer", "Firmware Engineer", "Embedded Software Engineer"],
    keywords: [
      "Embedded", "C", "C++", "microcontroller", "ARM", "Cortex",
      "STM32", "ESP32", "Arduino", "RTOS", "FreeRTOS",
      "GPIO", "UART", "SPI", "I2C", "CAN", "PWM", "ADC",
      "interrupt", "timer", "bootloader", "firmware", "bare metal",
      "HAL", "register", "linker", "memory map", "DMA",
      "IoT", "MQTT", "Wi-Fi", "Bluetooth", "sensor",
      "Keil", "IAR", "STM32CubeIDE", "oscilloscope", "JTAG",
    ],
  },
  "Semiconductor Research": {
    color: "#fbbf24",
    roles: ["Research Engineer", "Device Engineer", "R&D Engineer"],
    keywords: [
      "FinFET", "GAA", "gate-all-around", "nanosheet", "TFET",
      "device physics", "TCAD", "process simulation", "device simulation",
      "CMOS scaling", "short channel effects", "threshold voltage",
      "leakage current", "subthreshold", "tunneling",
      "SRAM", "MRAM", "ReRAM", "compute-in-memory",
      "AI accelerator", "chiplet", "3D IC", "TSV", "advanced packaging",
      "IMEC", "TSMC", "research paper", "patent", "publication",
      "Sentaurus", "Silvaco", "COMSOL", "Python", "MATLAB",
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGrade(score: number): string {
  if (score >= 80) return "S";
  if (score >= 65) return "A";
  if (score >= 50) return "B";
  if (score >= 35) return "C";
  return "D";
}

function computeRoleScores(resumeText: string) {
  const upper = resumeText.toUpperCase();
  const scores: Array<{
    domain: string; role: string; score: number;
    matchedKeywords: string[]; missingKeywords: string[]; color: string;
  }> = [];

  for (const [domain, config] of Object.entries(DOMAIN_ROLES)) {
    const matched = config.keywords.filter(k => upper.includes(k.toUpperCase()));
    const missing = config.keywords.filter(k => !upper.includes(k.toUpperCase()));
    const score = Math.round((matched.length / config.keywords.length) * 100);

    for (const role of config.roles) {
      scores.push({
        domain, role, score,
        matchedKeywords: matched.slice(0, 12),
        missingKeywords: missing.slice(0, 8),
        color: config.color,
      });
    }
  }

  // One entry per domain, sorted by score desc
  const seen = new Set<string>();
  return scores
    .sort((a, b) => b.score - a.score)
    .filter(s => { if (seen.has(s.domain)) return false; seen.add(s.domain); return true; })
    .slice(0, 8); // show all 8 VLSI domains
}

function generateLocalAnalysis(
  resumeText: string,
  roleScores: ReturnType<typeof computeRoleScores>,
  overallScore: number
) {
  const topRole = roleScores[0];
  const upper = resumeText.toUpperCase();
  const allKeywords = Object.values(DOMAIN_ROLES).flatMap(d => d.keywords);
  const foundSkills = allKeywords.filter(k => upper.includes(k.toUpperCase()));

  // ── Strengths ──
  const strengths: string[] = [];
  if (foundSkills.length > 15) strengths.push(`Strong VLSI technical breadth — ${foundSkills.length} relevant keywords detected across domains`);
  if (upper.includes("PROJECT") || upper.includes("DESIGNED") || upper.includes("IMPLEMENTED")) strengths.push("Hands-on hardware/design project experience demonstrated");
  if (upper.includes("GITHUB") || upper.includes("PORTFOLIO") || upper.includes("GITLAB")) strengths.push("Active GitHub or portfolio presence mentioned");
  if (upper.includes("INTERN") || upper.includes("TRAINEE") || upper.includes("INDUSTRY")) strengths.push("Industry internship or work experience present");
  if (upper.includes("B.TECH") || upper.includes("B.E") || upper.includes("M.TECH") || upper.includes("VLSI") || upper.includes("ECE")) strengths.push("Relevant ECE/VLSI educational background");
  if (upper.includes("CERTIFICATE") || upper.includes("COURSE") || upper.includes("NPTEL") || upper.includes("COURSERA")) strengths.push("Additional certifications or online courses completed");
  if (topRole.score >= 50) strengths.push(`Good alignment with ${topRole.domain} — ${topRole.score}% keyword match`);
  if (upper.includes("SIMULATION") || upper.includes("WAVEFORM") || upper.includes("TESTBENCH")) strengths.push("Simulation and verification skills present");
  while (strengths.length < 4) strengths.push("Resume includes relevant VLSI/semiconductor terminology");

  // ── Suggestions ──
  const suggestions: string[] = [];
  const topMissing = roleScores[0]?.missingKeywords || [];
  if (topMissing.length > 0) suggestions.push(`Add missing ${topRole.domain} keywords to your skills section: ${topMissing.slice(0, 3).join(", ")}`);
  if (!upper.includes("GITHUB") && !upper.includes("PORTFOLIO")) suggestions.push("Add a GitHub or EDA project portfolio link to show hands-on work");
  if (!upper.includes("%") && !upper.includes("IMPROVED") && !upper.includes("ACHIEVED")) suggestions.push("Quantify achievements — e.g., 'achieved 96% fault coverage', 'reduced slack violation by 2ns'");
  if (!upper.includes("TOOL") && !upper.includes("CADENCE") && !upper.includes("SYNOPSYS") && !upper.includes("VIVADO")) suggestions.push(`Mention industry EDA tools used in ${topRole.domain} (Cadence, Synopsys, Vivado, etc.)`);
  if (upper.length < 2000) suggestions.push("Resume seems brief — add more detail about your VLSI projects, tools used, and results achieved");
  suggestions.push(`Tailor your resume for ${topRole.role} roles by mirroring keywords from actual job descriptions on LinkedIn/Naukri`);
  suggestions.push(`Focus on strengthening ${roleScores[1]?.domain || "your second domain"} as a secondary skill — it increases your placement options`);

  // ── Summary ──
  const summary = `Your resume best matches ${topRole.role} in ${topRole.domain} with a ${topRole.score}% keyword alignment. ${foundSkills.length > 10 ? `${foundSkills.length} VLSI-relevant skills were detected, indicating a solid semiconductor foundation.` : "Adding more domain-specific VLSI keywords will significantly improve your match score."} ${overallScore >= 50 ? "Your profile is competitive for VLSI roles — use the suggestions below to sharpen it further." : "Follow the improvement tips below to make your resume stand out to VLSI recruiters."}`;

  return {
    summary,
    strengths: strengths.slice(0, 5),
    suggestions: suggestions.slice(0, 5),
  };
}

// ── Main Service ──────────────────────────────────────────────────────────────
export class PlacementService {
  async analyzeResume(buffer: Buffer, filename: string, userId?: string) {
    let resumeText = "";
    try {
      const pdfData = await pdfParse(buffer, { max: 0 });
      resumeText = pdfData.text || "";
    } catch (err: any) {
      try {
        const pdfData = await pdfParse(Buffer.from(buffer));
        resumeText = pdfData.text || "";
      } catch {
        throw new Error("Failed to parse PDF. Please ensure it is a valid, text-based PDF.");
      }
    }

    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error("PDF appears to be empty or image-only. Please upload a text-based PDF.");
    }

    const roleScores = computeRoleScores(resumeText);
    const topRole = roleScores[0];
    const overallScore = Math.round(
      roleScores.reduce((sum, r) => sum + r.score, 0) / roleScores.length
    );
    const analysis = generateLocalAnalysis(resumeText, roleScores, overallScore);

    if (userId) {
      try {
        await (prisma as any).resumeAnalysis.create({
          data: {
            userId, filename, overallScore,
            topRole: topRole.role,
            topDomain: topRole.domain,
            summary: analysis.summary,
            suggestions: analysis.suggestions,
            strengths: analysis.strengths,
            roleScores: JSON.stringify(roleScores),
          },
        });
      } catch (dbErr) {
        logger.warn("DB save skipped: " + dbErr);
      }
    }

    return {
      overallScore,
      overallGrade: getGrade(overallScore),
      summary: analysis.summary,
      topRole,
      allRoles: roleScores,
      suggestions: analysis.suggestions,
      strengths: analysis.strengths,
    };
  }

  async getAnalysisHistory(userId: string) {
    try {
      return await (prisma as any).resumeAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, filename: true, overallScore: true,
          topRole: true, topDomain: true, createdAt: true,
        },
      });
    } catch {
      return [];
    }
  }
}