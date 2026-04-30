export interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number;
}

export const BATTLE_QUESTIONS: Record<string, Question[]> = {
  rtl: [
    { id: 1, q: "What is the critical path in a digital circuit?", options: ["Shortest path", "Longest timing path", "Power path", "Reset path"], answer: 1 },
    { id: 2, q: "What does synthesis convert RTL into?", options: ["GDSII", "Gate netlist", "Bitstream", "Schematic"], answer: 1 },
    { id: 3, q: "What is a latch vs flip-flop?", options: ["Same thing", "Latch is level-sensitive, FF is edge-sensitive", "FF is level-sensitive", "No difference"], answer: 1 },
    { id: 4, q: "What causes metastability?", options: ["Wrong clock", "Setup/hold violation", "Power noise", "Routing congestion"], answer: 1 },
    { id: 5, q: "What is clock gating used for?", options: ["Faster clock", "Power reduction", "Better timing", "Area reduction"], answer: 1 },
    { id: 6, q: "What does FSM stand for?", options: ["Fast Signal Mode", "Finite State Machine", "Functional Simulation Model", "Frequency Scaling Method"], answer: 1 },
    { id: 7, q: "Which Verilog keyword declares a sequential block?", options: ["always @*", "always @(posedge clk)", "initial", "assign"], answer: 1 },
    { id: 8, q: "What is pipelining used for?", options: ["Reduce area", "Increase throughput", "Reduce power", "Fix timing"], answer: 1 },
    { id: 9, q: "What is a race condition in RTL?", options: ["Fast simulation", "Unpredictable output due to timing", "Clock domain issue", "Power spike"], answer: 1 },
    { id: 10, q: "What is CDC?", options: ["Clock Domain Crossing", "Combinational Design Check", "Clock Duty Cycle", "Circuit Design Constraint"], answer: 0 },
  ],
  verification: [
    { id: 1, q: "What does UVM stand for?", options: ["Universal Verification Methodology", "Unified VM Model", "Unit Verification Method", "Universal VLSI Model"], answer: 0 },
    { id: 2, q: "What is functional coverage?", options: ["Code coverage", "Measuring design space exercised", "Bug count", "Simulation speed"], answer: 1 },
    { id: 3, q: "What is a scoreboard in UVM?", options: ["A leaderboard", "Checks DUT output vs expected", "Measures coverage", "Counts errors"], answer: 1 },
    { id: 4, q: "What does SVA stand for?", options: ["SystemVerilog Assertions", "Standard Verification Architecture", "Signal Value Analysis", "Simulation Value Audit"], answer: 0 },
    { id: 5, q: "What is constrained random verification?", options: ["Manual test writing", "Auto-generating valid stimuli within constraints", "Coverage driven testing", "Formal verification"], answer: 1 },
    { id: 6, q: "What is a driver in UVM?", options: ["Checks output", "Sends transactions to DUT", "Generates coverage", "Compares results"], answer: 1 },
    { id: 7, q: "What does DUT stand for?", options: ["Design Under Test", "Digital Unit Transfer", "Device Utility Tool", "Data Unit Type"], answer: 0 },
    { id: 8, q: "What is a virtual interface in SV?", options: ["An abstract class", "A handle to a physical interface", "A coverage group", "A transaction type"], answer: 1 },
    { id: 9, q: "What is code coverage?", options: ["Tracking XP", "Measuring which RTL lines were executed", "Counting assertions", "Checking timing"], answer: 1 },
    { id: 10, q: "What is a monitor in UVM?", options: ["Sends stimuli", "Passively observes interface signals", "Compares expected vs actual", "Generates random data"], answer: 1 },
  ],
  "physical-design": [
    { id: 1, q: "What is floorplanning?", options: ["Routing wires", "Placing macro blocks and I/O", "Timing analysis", "Power grid design"], answer: 1 },
    { id: 2, q: "What does STA stand for?", options: ["Static Timing Analysis", "Signal Timing Adjustment", "Synthesis Timing Architecture", "Standard Test Analysis"], answer: 0 },
    { id: 3, q: "What is DRC?", options: ["Design Rule Check", "Digital Register Count", "Data Routing Check", "Device Rule Compliance"], answer: 0 },
    { id: 4, q: "What is LVS?", options: ["Layout Versus Schematic", "Logic Verification System", "Level Voltage Scan", "Local Via Stack"], answer: 0 },
    { id: 5, q: "What is the purpose of a buffer in timing?", options: ["Reduce power", "Drive large loads and fix slew", "Reduce area", "Add logic"], answer: 1 },
    { id: 6, q: "What is clock tree synthesis?", options: ["Routing data signals", "Distributing clock with balanced skew", "Placing standard cells", "Power analysis"], answer: 1 },
    { id: 7, q: "What is IR drop?", options: ["Voltage drop across power grid resistance", "Current rise in signals", "Impedance ratio", "Interconnect resistance"], answer: 0 },
    { id: 8, q: "What is antenna effect?", options: ["Signal interference", "Charge buildup during manufacturing damaging gates", "Power leakage", "Clock noise"], answer: 1 },
    { id: 9, q: "What is tapeout?", options: ["Testing on FPGA", "Sending final design to fabrication", "Writing testbench", "Synthesis step"], answer: 1 },
    { id: 10, q: "What is ECO in physical design?", options: ["Engineering Change Order", "Electrical Circuit Optimization", "Enhanced Clock Operation", "Extraction Correction Output"], answer: 0 },
  ],
  analog: [
    { id: 1, q: "What is a MOSFET?", options: ["Metal Oxide Semiconductor Field Effect Transistor", "Modulated Output Signal FET", "Multi Output Signal Transistor", "Metal Oxide Signal Filter"], answer: 0 },
    { id: 2, q: "What is gain-bandwidth product?", options: ["Gain × frequency = constant", "Area × speed product", "Power × efficiency", "Noise × gain"], answer: 0 },
    { id: 3, q: "What is a differential amplifier?", options: ["Amplifies sum of inputs", "Amplifies difference between two inputs", "Single input amplifier", "Digital to analog converter"], answer: 1 },
    { id: 4, q: "What is slew rate?", options: ["Max rate of output voltage change", "Gain at high frequency", "Input impedance", "Output resistance"], answer: 0 },
    { id: 5, q: "What is CMRR?", options: ["Common Mode Rejection Ratio", "Current Mode Resistance Ratio", "Circuit Modulation Rate Ratio", "Common Mode Rise Rate"], answer: 0 },
    { id: 6, q: "What is a bandgap reference?", options: ["A filter circuit", "Temperature-independent voltage reference", "RF amplifier", "Clock generator"], answer: 1 },
    { id: 7, q: "What is thermal noise?", options: ["Heat damage to circuits", "Random noise due to electron thermal motion", "Power supply noise", "Ground bounce"], answer: 1 },
    { id: 8, q: "What is an op-amp?", options: ["Operational Amplifier", "Optical Amplifier", "Output Power Amplifier", "Oscillator Phase Amplifier"], answer: 0 },
    { id: 9, q: "What is negative feedback used for?", options: ["Increase gain", "Stabilize gain and reduce distortion", "Oscillation", "Increase bandwidth"], answer: 1 },
    { id: 10, q: "What is a PLL?", options: ["Phase Locked Loop", "Power Level Limiter", "Pulse Level Logic", "Phase Load Lock"], answer: 0 },
  ],
  fpga: [
    { id: 1, q: "What does FPGA stand for?", options: ["Field Programmable Gate Array", "Fixed Program Gate Architecture", "Fast Processing Gate Array", "Flexible Programmable Gate Algorithm"], answer: 0 },
    { id: 2, q: "What is a LUT in FPGA?", options: ["Look-Up Table", "Logic Unit Transfer", "Layer Utility Tool", "Local Update Terminal"], answer: 0 },
    { id: 3, q: "What is bitstream in FPGA?", options: ["Data stream", "Configuration file that programs FPGA", "Clock signal", "Test pattern"], answer: 1 },
    { id: 4, q: "What is DSP slice in FPGA?", options: ["Display processor", "Dedicated hardware for math operations", "Data storage primitive", "Debug scan port"], answer: 1 },
    { id: 5, q: "What language is used to program FPGAs?", options: ["C/C++", "Python", "HDL (VHDL/Verilog)", "Assembly"], answer: 2 },
    { id: 6, q: "What is partial reconfiguration in FPGA?", options: ["Partial power down", "Reconfiguring part of FPGA while rest runs", "Debug feature", "Clock switching"], answer: 1 },
    { id: 7, q: "What is BRAM in FPGA?", options: ["Block RAM — on-chip memory", "Bus Read Access Module", "Binary Register Array Module", "Base Register Addressing Mode"], answer: 0 },
    { id: 8, q: "What is timing closure in FPGA?", options: ["Closing the design", "Meeting all timing constraints after P&R", "Power optimization", "Logic minimization"], answer: 1 },
    { id: 9, q: "What is place and route?", options: ["Software debugging", "Mapping netlist to FPGA physical resources", "Simulation step", "Synthesis process"], answer: 1 },
    { id: 10, q: "What is IP core in FPGA?", options: ["Internet Protocol", "Reusable pre-designed logic block", "Input Port", "Integrated Power core"], answer: 1 },
  ],
  embedded: [
    { id: 1, q: "What is RTOS?", options: ["Real Time Operating System", "Remote Terminal OS", "Rapid Transfer OS", "Register Transfer OS"], answer: 0 },
    { id: 2, q: "What is ISR?", options: ["Interrupt Service Routine", "Input Signal Register", "Internal System Reset", "Instruction Set Register"], answer: 0 },
    { id: 3, q: "What is DMA?", options: ["Direct Memory Access", "Digital Memory Allocation", "Data Management Architecture", "Device Memory Address"], answer: 0 },
    { id: 4, q: "What is a watchdog timer?", options: ["Time display", "Hardware timer that resets system if software hangs", "Performance monitor", "Clock divider"], answer: 1 },
    { id: 5, q: "What is SPI?", options: ["Serial Peripheral Interface", "System Program Interface", "Signal Processing Input", "Serial Parallel Interconnect"], answer: 0 },
    { id: 6, q: "What is I2C?", options: ["Inter-Integrated Circuit protocol", "Internal Interface Connection", "Input/Output 2 Channel", "Integrated Interface Circuit"], answer: 0 },
    { id: 7, q: "What is stack overflow in embedded?", options: ["Too much data", "Stack pointer exceeds allocated stack memory", "Heap corruption", "Buffer overflow"], answer: 1 },
    { id: 8, q: "What is PWM?", options: ["Pulse Width Modulation", "Power Wave Management", "Peripheral Write Mode", "Processor Work Mode"], answer: 0 },
    { id: 9, q: "What is UART?", options: ["Universal Asynchronous Receiver Transmitter", "Unit Address Register Transfer", "Unified Async Radio Terminal", "Universal Analog Radio Transfer"], answer: 0 },
    { id: 10, q: "What is memory-mapped I/O?", options: ["I/O uses same address space as memory", "Memory used for I/O buffering", "I/O mapped to cache", "Virtual I/O addresses"], answer: 0 },
  ],
  dft: [
    { id: 1, q: "What does DFT stand for?", options: ["Design For Testability", "Digital Frequency Transform", "Design Functional Test", "Device Fault Testing"], answer: 0 },
    { id: 2, q: "What is scan chain?", options: ["Supply chain", "Series of flip-flops connected for test", "Clock distribution", "Power network"], answer: 1 },
    { id: 3, q: "What is ATPG?", options: ["Automatic Test Pattern Generation", "Advanced Timing Path Generation", "Automatic Timing Parameter Guide", "Analog Test Pattern Generator"], answer: 0 },
    { id: 4, q: "What is fault coverage?", options: ["Bug count", "Percentage of faults detected by test patterns", "Code coverage", "Timing margin"], answer: 1 },
    { id: 5, q: "What is BIST?", options: ["Built-In Self Test", "Binary Instruction Set Test", "Board Integrated System Test", "Basic Input Scan Test"], answer: 0 },
    { id: 6, q: "What is a stuck-at fault?", options: ["Signal stuck at logic 0 or 1", "Clock stuck", "Power fault", "Timing fault"], answer: 0 },
    { id: 7, q: "What is JTAG?", options: ["Joint Test Action Group standard", "Java Test Application Guide", "Junction Timing Analysis Gate", "Joint Transistor Array Group"], answer: 0 },
    { id: 8, q: "What is compression in DFT?", options: ["Data compression", "Reducing test data volume while maintaining coverage", "Power reduction", "Area optimization"], answer: 1 },
    { id: 9, q: "What is boundary scan?", options: ["Edge detection", "Testing PCB interconnects via JTAG", "Scan chain at chip boundary", "I/O testing"], answer: 1 },
    { id: 10, q: "What is defect coverage?", options: ["Same as fault coverage", "Percentage of real manufacturing defects caught", "Test pattern count", "Simulation coverage"], answer: 1 },
  ],
  research: [
    { id: 1, q: "What is VLSI?", options: ["Very Large Scale Integration", "Virtual Logic System Interface", "Voltage Level Signal Input", "Variable Length Signal Integration"], answer: 0 },
    { id: 2, q: "What is Moore's Law?", options: ["Power doubles every 2 years", "Transistor count doubles every ~2 years", "Speed doubles every year", "Cost halves every year"], answer: 1 },
    { id: 3, q: "What is FinFET?", options: ["Fin-shaped Field Effect Transistor", "Finite FET", "Final FET technology", "Fixed Input FET"], answer: 0 },
    { id: 4, q: "What is 3D IC?", options: ["3D printed IC", "Stacking multiple dies vertically", "3 dimensional routing", "Triple density IC"], answer: 1 },
    { id: 5, q: "What is neuromorphic computing?", options: ["Brain surgery computing", "Computing inspired by neural brain structure", "Neural network training", "Memory computing"], answer: 1 },
    { id: 6, q: "What is quantum computing advantage?", options: ["Faster classical compute", "Solving certain problems exponentially faster", "Low power operation", "High temperature operation"], answer: 1 },
    { id: 7, q: "What is approximate computing?", options: ["Estimation software", "Trading accuracy for performance/power gains", "Approximate simulation", "Fuzzy logic"], answer: 1 },
    { id: 8, q: "What is near-threshold computing?", options: ["Operating near supply voltage threshold for low power", "Computing near memory", "Threshold logic gates", "Near field communication"], answer: 0 },
    { id: 9, q: "What is chiplet architecture?", options: ["Small chips", "Modular dies integrated in one package", "Chip testing method", "Low cost chip design"], answer: 1 },
    { id: 10, q: "What is in-memory computing?", options: ["Cache computing", "Performing computation inside memory array", "RAM optimization", "Virtual memory"], answer: 1 },
  ],
};

export const getRandomQuestions = (domainId: string, count = 5): Question[] => {
  const pool = BATTLE_QUESTIONS[domainId] ?? BATTLE_QUESTIONS.rtl;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
