export type Level = {
  id: number;
  level: number;
  title: string;
  difficulty: string;
  xp: number;
  hours: number;
  position: "left" | "center" | "right" | string;
  topics: string[];
  lab: string;
  labType: string;
  companies?: string[];
  badge?: string;
};

export type DomainId = "rtl" | "verification" | "physical-design" | "analog" | "fpga" | "embedded" | "dft" | "research";

export const ROADMAPS: Record<DomainId, Level[]> = {
  rtl: [
    { id: 0, level:0, title:"Semiconductor Foundations", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["What is VLSI","ASIC vs FPGA","Frontend vs Backend","Chip Design Flow","Moore's Law"], lab:"Match design flow stages", labType:"quiz" },
    { id: 1, level:1, title:"Digital Logic Mastery", difficulty:"Beginner", xp:80, hours:4, position:"right", topics:["Number systems","Boolean algebra","Logic gates","K-Maps","Combinational circuits","Sequential circuits"], lab:"Full Adder + Multiplexer", labType:"simulation" },
    { id: 2, level:2, title:"Verilog Basics", difficulty:"Beginner+", xp:120, hours:6, position:"center", topics:["module","wire/reg","assign","always block","operators","basic testbench"], lab:"4-bit Adder + Comparator + ALU", labType:"coding" },
    { id: 3, level:3, title:"Advanced Verilog", difficulty:"Intermediate", xp:150, hours:7, position:"left", topics:["FSM","Parameterized modules","Counters","Shift registers","Memories","Generate blocks"], lab:"UART TX + Traffic Light FSM", labType:"project" },
    { id: 4, level:4, title:"SystemVerilog Essentials", difficulty:"Intermediate", xp:160, hours:5, position:"center", topics:["logic","always_ff","always_comb","enums","structs","interfaces"], lab:"Convert Verilog to SystemVerilog", labType:"coding" },
    { id: 5, level:5, title:"RTL Coding Standards", difficulty:"Intermediate", xp:180, hours:6, position:"right", topics:["Clean style","Latch avoidance","Reset strategy","CDC basics","Reusable modules","Naming rules"], lab:"Fix broken RTL code", labType:"challenge" },
    { id: 6, level:6, title:"Synthesis Concepts", difficulty:"Intermediate+", xp:220, hours:7, position:"center", topics:["RTL to gate netlist","Constraints","Libraries","Area vs speed","Optimization"], lab:"Synopsys DC / Yosys basics", labType:"tool" },
    { id: 7, level:7, title:"Timing Basics", difficulty:"Advanced", xp:240, hours:6, position:"left", topics:["Setup","Hold","Slack","Clock uncertainty","Critical path"], lab:"Fix timing violation", labType:"challenge" },
    { id: 8, level:8, title:"Real Protocol RTL", difficulty:"Advanced", xp:300, hours:8, position:"center", topics:["UART","SPI","I2C","FIFO","Handshake logic"], lab:"Build UART controller", labType:"project" },
    { id: 9, level:9, title:"Industry RTL Projects", difficulty:"Advanced", xp:400, hours:12, position:"right", topics:["RISC-V ALU","Cache Controller","DMA Controller","AXI-lite Slave","Memory Controller"], lab:"Choose 1 industry project", labType:"capstone" },
    { id: 10, level:10, title:"Verification for RTL", difficulty:"Advanced", xp:250, hours:5, position:"center", topics:["Testbench","Assertions","Coverage basics","Debugging flow"], lab:"Write assertions for your module", labType:"coding" },
    { id: 11, level:11, title:"Placement Readiness", difficulty:"Expert", xp:500, hours:10, position:"left", topics:["Resume","Interview Questions","Coding rounds","Debug mindset","Company prep"], lab:"Mock interview + resume review", labType:"career", companies:["Intel","Qualcomm","NVIDIA","AMD","MediaTek"] },
    { id: 12, level:12, title:"Elite Final Boss", difficulty:"Elite", xp:1000, hours:15, position:"center", topics:["Mini processor datapath","Controller design","Full integration","Timing sign-off"], lab:"Design mini processor datapath + controller", labType:"boss", badge:"RTL Architect" },
  ],
  verification: [
    { id: 0, level:0, title:"Verification Basics", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["What is verification","Why bugs cost millions","Frontend flow","RTL vs DV roles","Verification lifecycle"], lab:"Find bugs in sample chip flow", labType:"quiz" },
    { id: 1, level:1, title:"Digital Logic Refresher", difficulty:"Beginner", xp:80, hours:3, position:"right", topics:["FSM","Combinational logic","Sequential logic","Protocol basics","Timing basics"], lab:"Trace wrong output logic", labType:"simulation" },
    { id: 2, level:2, title:"SystemVerilog Basics", difficulty:"Beginner+", xp:120, hours:5, position:"center", topics:["logic","always_ff","Classes intro","Random variables","Interfaces","Testbench basics"], lab:"Write simple SV testbench", labType:"coding" },
    { id: 3, level:3, title:"Advanced SystemVerilog", difficulty:"Intermediate", xp:160, hours:7, position:"left", topics:["OOP","Inheritance","Polymorphism","Mailboxes","Semaphores","Constraints"], lab:"Random packet generator", labType:"project" },
    { id: 4, level:4, title:"Assertions Mastery", difficulty:"Intermediate", xp:180, hours:6, position:"center", topics:["SVA basics","Implication","Sequence","Properties","Protocol checking"], lab:"Write assertions for FIFO", labType:"challenge" },
    { id: 5, level:5, title:"Functional Coverage", difficulty:"Intermediate+", xp:220, hours:6, position:"right", topics:["covergroup","coverpoint","Bins","Crosses","Closure strategy"], lab:"Create full coverage model", labType:"coding" },
    { id: 6, level:6, title:"UVM Foundations", difficulty:"Advanced", xp:260, hours:8, position:"center", topics:["Components","env","Agent","Driver","Monitor","Sequencer"], lab:"Build mini UVM environment", labType:"project" },
    { id: 7, level:7, title:"UVM Advanced", difficulty:"Advanced", xp:300, hours:8, position:"left", topics:["Factory","config_db","Sequences","Scoreboard","Callbacks"], lab:"Protocol verification env", labType:"project" },
    { id: 8, level:8, title:"Debugging Elite Mode", difficulty:"Advanced+", xp:320, hours:7, position:"center", topics:["Waveform debugging","Root cause analysis","Log tracing","Regressions","Failures triage"], lab:"Fix hidden random bug", labType:"challenge" },
    { id: 9, level:9, title:"Real Protocol Verification", difficulty:"Advanced+", xp:400, hours:12, position:"right", topics:["AXI verification","UART verification","SPI verification","I2C verification","FIFO verification"], lab:"Choose 1 protocol environment", labType:"capstone" },
    { id: 10, level:10, title:"Industry Regressions", difficulty:"Expert", xp:280, hours:6, position:"center", topics:["Nightly runs","Seed failures","Automation","Scripting","Metrics"], lab:"Build regression dashboard", labType:"tool" },
    { id: 11, level:11, title:"Placement Readiness", difficulty:"Expert", xp:500, hours:10, position:"left", topics:["Resume","Interview questions","Debugging rounds","SV/UVM interview prep"], lab:"Mock interview + SV quiz", labType:"career", companies:["Intel","Qualcomm","NVIDIA","AMD","Synopsys","Cadence"] },
    { id: 12, level:12, title:"Verification Final Boss", difficulty:"Elite", xp:1000, hours:15, position:"center", topics:["DMA/FIFO/AXI-lite IP","Full UVM env","Scoreboard","Assertions + Coverage"], lab:"Complete UVM env for DMA / FIFO / AXI-lite IP", labType:"boss", badge:"Verification Architect" },
  ],
  "physical-design": [
    { id: 0, level:0, title:"Backend Foundations", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["What is Physical Design","Frontend vs Backend","ASIC design flow","RTL to GDSII overview","PPA basics"], lab:"Map full chip flow", labType:"quiz" },
    { id: 1, level:1, title:"Linux + Scripting", difficulty:"Beginner", xp:90, hours:3, position:"right", topics:["Linux commands","Shell basics","File systems","Tcl intro","Automation mindset"], lab:"Run PD automation scripts", labType:"coding" },
    { id: 2, level:2, title:"Libraries + Constraints", difficulty:"Beginner+", xp:130, hours:5, position:"center", topics:["Liberty files","LEF / DEF","SDC basics","Corners","MMMC intro"], lab:"Read and validate timing constraints", labType:"coding" },
    { id: 3, level:3, title:"Floorplanning", difficulty:"Intermediate", xp:180, hours:6, position:"left", topics:["Core area","Aspect ratio","Utilization","Macro placement","IO placement","Power planning intro"], lab:"Create chip floorplan", labType:"project" },
    { id: 4, level:4, title:"Power Planning", difficulty:"Intermediate", xp:220, hours:5, position:"center", topics:["Power rings","Straps","Rails","IR Drop basics","EM awareness"], lab:"Design power grid", labType:"project" },
    { id: 5, level:5, title:"Placement Engineering", difficulty:"Intermediate+", xp:260, hours:7, position:"right", topics:["Standard cells","Global placement","Detailed placement","Congestion","Density optimization"], lab:"Fix congested region", labType:"challenge" },
    { id: 6, level:6, title:"Clock Tree Synthesis", difficulty:"Advanced", xp:300, hours:7, position:"center", topics:["Clock buffers","Skew","Latency","Insertion delay","Useful skew"], lab:"Build balanced clock tree", labType:"project" },
    { id: 7, level:7, title:"Routing", difficulty:"Advanced", xp:320, hours:8, position:"left", topics:["Global routing","Detailed routing","Vias","DRC issues","Antenna basics"], lab:"Route congested block", labType:"challenge" },
    { id: 8, level:8, title:"Static Timing Analysis", difficulty:"Advanced", xp:350, hours:7, position:"center", topics:["Setup","Hold","Slack","Critical paths","OCV basics"], lab:"Fix hold violation", labType:"challenge" },
    { id: 9, level:9, title:"Signoff Closure", difficulty:"Advanced+", xp:420, hours:9, position:"right", topics:["DRC","LVS","IR drop","EM checks","ECO flow"], lab:"Close final signoff", labType:"capstone" },
    { id: 10, level:10, title:"Industry Implementation", difficulty:"Expert", xp:500, hours:14, position:"center", topics:["CPU block backend","SRAM wrapper","GPU subsystem","PCIe controller","AI accelerator block"], lab:"Choose 1 industry block", labType:"capstone" },
    { id: 11, level:11, title:"Placement Readiness", difficulty:"Expert", xp:600, hours:12, position:"left", topics:["Resume","Interview questions","Tool commands","Timing debug rounds","PD interview scenarios"], lab:"Mock interview + PD quiz", labType:"career", companies:["Qualcomm","Intel","NVIDIA","AMD","MediaTek","Apple","Samsung"] },
    { id: 12, level:12, title:"GDSII Final Boss", difficulty:"Elite", xp:1200, hours:18, position:"center", topics:["RTL to GDSII flow","Timing closure","DRC/LVS clean","Tapeout prep"], lab:"Complete RTL-to-GDSII mini chip with clean closure", labType:"boss", badge:"Physical Design Architect" },
  ],
  analog: [
    { id: 0, level:0, title:"Analog Foundations", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["What is analog IC design","Why analog still matters","Mixed-signal overview","CMOS basics","Real-world interfaces"], lab:"Identify analog blocks in a smartphone", labType:"quiz" },
    { id: 1, level:1, title:"Circuit Fundamentals", difficulty:"Beginner", xp:90, hours:3, position:"right", topics:["Ohm's law","KCL / KVL","RC / RL basics","Frequency response","Small signal concepts"], lab:"RC filter analysis", labType:"simulation" },
    { id: 2, level:2, title:"MOSFET Deep Dive", difficulty:"Beginner+", xp:130, hours:5, position:"center", topics:["MOS structure","Regions of operation","Threshold voltage","gm, ro","Body effect"], lab:"Plot IV curves", labType:"coding" },
    { id: 3, level:3, title:"Current Mirrors", difficulty:"Intermediate", xp:170, hours:5, position:"left", topics:["Basic mirror","Cascode mirror","Widlar mirror","Matching concepts"], lab:"Design stable bias current source", labType:"project" },
    { id: 4, level:4, title:"Differential Amplifiers", difficulty:"Intermediate", xp:220, hours:6, position:"center", topics:["Diff pair","Tail current source","Gain","CMRR","Offset"], lab:"Build differential pair", labType:"project" },
    { id: 5, level:5, title:"Operational Amplifiers", difficulty:"Intermediate+", xp:260, hours:7, position:"right", topics:["2-stage op-amp","Compensation","Phase margin","Slew rate","GBW"], lab:"Design CMOS op-amp", labType:"project" },
    { id: 6, level:6, title:"Noise + Mismatch", difficulty:"Advanced", xp:280, hours:6, position:"center", topics:["Thermal noise","Flicker noise","Device mismatch","Monte Carlo basics"], lab:"Noise optimization challenge", labType:"challenge" },
    { id: 7, level:7, title:"Data Converters", difficulty:"Advanced", xp:320, hours:7, position:"left", topics:["ADC basics","SAR ADC","Flash ADC","DAC basics","INL / DNL"], lab:"Choose right ADC architecture", labType:"challenge" },
    { id: 8, level:8, title:"PLL + Clocking", difficulty:"Advanced", xp:350, hours:7, position:"center", topics:["PLL basics","VCO","Charge pump","Loop filter","Jitter"], lab:"PLL block debugging", labType:"project" },
    { id: 9, level:9, title:"Power Management", difficulty:"Advanced+", xp:400, hours:8, position:"right", topics:["LDO","Bandgap reference","Regulators","Efficiency basics"], lab:"Design low-noise regulator", labType:"project" },
    { id: 10, level:10, title:"Layout Awareness", difficulty:"Expert", xp:420, hours:7, position:"center", topics:["Common centroid","Matching layout","Parasitics","Shielding","Guard rings"], lab:"Fix poor matching layout", labType:"challenge" },
    { id: 11, level:11, title:"Placement Readiness", difficulty:"Expert", xp:600, hours:12, position:"left", topics:["Resume","Interview questions","Transistor reasoning rounds","Op-amp interview prep","Industry tools"], lab:"Mock interview + analog quiz", labType:"career", companies:["Texas Instruments","Analog Devices","Qualcomm","MediaTek","Infineon","NXP"] },
    { id: 12, level:12, title:"Analog Final Boss", difficulty:"Elite", xp:1200, hours:18, position:"center", topics:["Two-stage CMOS op-amp","Gain spec","Bandwidth spec","Phase margin spec","Full justification"], lab:"Design 2-stage CMOS op-amp meeting gain, BW, and PM specs", labType:"boss", badge:"Analog Architect" },
  ],
  fpga: [
    { id: 0, level:0, title:"FPGA Foundations", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["What is FPGA","FPGA vs ASIC","LUT / FF basics","Reconfigurable logic","Use cases"], lab:"Identify FPGA applications", labType:"quiz" },
    { id: 1, level:1, title:"Digital Logic Refresher", difficulty:"Beginner", xp:90, hours:3, position:"right", topics:["Gates","Mux","Counters","FSM","Sequential logic"], lab:"LED counter design", labType:"simulation" },
    { id: 2, level:2, title:"Verilog for FPGA", difficulty:"Beginner+", xp:130, hours:5, position:"center", topics:["Modules","always blocks","Counters","FSM coding","Testbench basics"], lab:"Traffic light controller", labType:"coding" },
    { id: 3, level:3, title:"Vivado Workflow", difficulty:"Intermediate", xp:180, hours:5, position:"left", topics:["Project setup","Synthesis","Implementation","Bitstream","Reports"], lab:"First FPGA build flow", labType:"tool" },
    { id: 4, level:4, title:"Constraints + Timing", difficulty:"Intermediate", xp:220, hours:6, position:"center", topics:["XDC basics","Clocks","Pin mapping","Setup/hold","Timing reports"], lab:"Fix timing failure", labType:"challenge" },
    { id: 5, level:5, title:"IO Interfaces", difficulty:"Intermediate+", xp:260, hours:6, position:"right", topics:["Switches","Buttons","UART","SPI","I2C"], lab:"UART transmitter on FPGA", labType:"project" },
    { id: 6, level:6, title:"Memories + DSP", difficulty:"Advanced", xp:300, hours:7, position:"center", topics:["BRAM","ROM","FIFOs","DSP slices","Pipelining"], lab:"Build MAC unit", labType:"project" },
    { id: 7, level:7, title:"Embedded FPGA SoC", difficulty:"Advanced", xp:330, hours:8, position:"left", topics:["Zynq basics","Processor + PL","AXI bus","GPIO control"], lab:"Processor controls LEDs via AXI", labType:"project" },
    { id: 8, level:8, title:"High Speed Design", difficulty:"Advanced", xp:360, hours:7, position:"center", topics:["CDC basics","SERDES intro","Clock managers","Reset strategy"], lab:"Dual clock domain FIFO", labType:"challenge" },
    { id: 9, level:9, title:"Real FPGA Projects", difficulty:"Advanced+", xp:450, hours:12, position:"right", topics:["VGA controller","UART terminal","Digital oscilloscope","Audio processor","CNN accelerator"], lab:"Choose 1 real project build", labType:"capstone" },
    { id: 10, level:10, title:"Optimization", difficulty:"Expert", xp:380, hours:7, position:"center", topics:["Area reduction","Timing closure","Pipelining","Floorplanning basics"], lab:"Increase Fmax by 20%", labType:"challenge" },
    { id: 11, level:11, title:"Placement Readiness", difficulty:"Expert", xp:600, hours:12, position:"left", topics:["Resume","Interview questions","Vivado practical rounds","HDL debugging"], lab:"Mock interview + HDL quiz", labType:"career", companies:["AMD Xilinx","Intel PSG","Lattice","Microchip","Qualcomm","MediaTek"] },
    { id: 12, level:12, title:"FPGA Final Boss", difficulty:"Elite", xp:1200, hours:18, position:"center", topics:["Custom IP design","SoC integration","Timing closure","Live demo"], lab:"FPGA SoC with custom IP + timing closure + live demo", labType:"boss", badge:"FPGA Architect" },
  ],
  embedded: [
    { id: 0, level:0, title:"Embedded Foundations", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["What is embedded systems","Real-world examples","Hardware + software integration","MCU vs MPU","Product lifecycle"], lab:"Identify embedded systems around you", labType:"quiz" },
    { id: 1, level:1, title:"C Programming Core", difficulty:"Beginner", xp:100, hours:5, position:"right", topics:["Variables & types","Loops & control","Functions","Pointers","Structs","Memory basics"], lab:"Sensor data parser in C", labType:"coding" },
    { id: 2, level:2, title:"Microcontroller Basics", difficulty:"Beginner+", xp:140, hours:6, position:"center", topics:["GPIO","Timers","ADC","PWM","Interrupts"], lab:"Blink LED + button input", labType:"simulation" },
    { id: 3, level:3, title:"Communication Protocols", difficulty:"Intermediate", xp:190, hours:7, position:"left", topics:["UART","SPI","I2C","CAN basics","Debugging buses"], lab:"Read sensor via I2C", labType:"project" },
    { id: 4, level:4, title:"ARM / STM32 Ecosystem", difficulty:"Intermediate", xp:230, hours:8, position:"center", topics:["ARM Cortex basics","STM32CubeIDE","HAL drivers","Register vs HAL coding"], lab:"Timer interrupt project", labType:"tool" },
    { id: 5, level:5, title:"Sensors + Actuators", difficulty:"Intermediate+", xp:260, hours:7, position:"right", topics:["Temperature sensors","IMU","Ultrasonic","Relays","Motors","Servos"], lab:"Smart fan controller", labType:"project" },
    { id: 6, level:6, title:"RTOS Foundations", difficulty:"Advanced", xp:300, hours:9, position:"center", topics:["Tasks","Scheduling","Queues","Semaphores","Timing determinism"], lab:"Dual-task LED + sensor system", labType:"coding" },
    { id: 7, level:7, title:"Firmware Engineering", difficulty:"Advanced", xp:320, hours:8, position:"left", topics:["Modular drivers","Boot flow","Memory maps","Debugging","Logs"], lab:"Structured firmware architecture", labType:"project" },
    { id: 8, level:8, title:"IoT Systems", difficulty:"Advanced", xp:360, hours:9, position:"center", topics:["Wi-Fi","Bluetooth","MQTT","Cloud basics","OTA updates"], lab:"Wi-Fi sensor dashboard", labType:"project" },
    { id: 9, level:9, title:"Real Projects", difficulty:"Advanced+", xp:450, hours:14, position:"right", topics:["Smart home node","Line follower robot","EV battery monitor","Weather station","Smart irrigation"], lab:"Choose one complete product build", labType:"capstone" },
    { id: 10, level:10, title:"Optimization + Reliability", difficulty:"Expert", xp:380, hours:8, position:"center", topics:["Low power modes","Watchdog timers","EMI basics","Fail-safe design","Field debugging"], lab:"Reduce battery usage by 30%", labType:"challenge" },
    { id: 11, level:11, title:"Placement Readiness", difficulty:"Expert", xp:600, hours:10, position:"left", topics:["Resume","C interview questions","Protocol debugging rounds","Firmware coding tests"], lab:"Mock technical interview", labType:"career", companies:["Bosch","Qualcomm","Texas Instruments","MediaTek","Continental","Tata Electronics","NXP"] },
    { id: 12, level:12, title:"Embedded Final Boss", difficulty:"Elite", xp:1200, hours:18, position:"center", topics:["Sensor input system","RTOS task design","Protocol integration","Cloud logging","End-to-end product"], lab:"Build full connected embedded product with sensor, RTOS, protocol, cloud", labType:"boss", badge:"Embedded Architect" },
  ],
  dft: [
    { id: 0, level:0, title:"Test Foundations", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["Why testing matters","Manufacturing defects","Yield basics","Frontend vs DFT role"], lab:"Identify defect types", labType:"quiz" },
    { id: 1, level:1, title:"Digital Logic Refresher", difficulty:"Beginner", xp:90, hours:4, position:"right", topics:["Sequential logic","Flip-flops","Controllability","Observability"], lab:"Trace unreachable node", labType:"simulation" },
    { id: 2, level:2, title:"Scan Chain Basics", difficulty:"Beginner+", xp:140, hours:6, position:"center", topics:["Muxed scan flop","Scan enable","Shift/capture","Chain stitching"], lab:"Create simple scan chain", labType:"coding" },
    { id: 3, level:3, title:"ATPG Foundations", difficulty:"Intermediate", xp:190, hours:7, position:"left", topics:["Stuck-at faults","Transition faults","Pattern generation","Fault simulation"], lab:"Generate test vectors", labType:"project" },
    { id: 4, level:4, title:"Coverage Optimization", difficulty:"Intermediate", xp:230, hours:6, position:"center", topics:["Test coverage","Hard faults","Redundancy","Improving patterns"], lab:"Raise coverage from 88% to 96%", labType:"challenge" },
    { id: 5, level:5, title:"Compression Techniques", difficulty:"Intermediate", xp:260, hours:7, position:"right", topics:["EDT","Decompression","Compaction","Tester memory limits"], lab:"Reduce pattern count", labType:"coding" },
    { id: 6, level:6, title:"MBIST", difficulty:"Intermediate+", xp:300, hours:8, position:"center", topics:["SRAM test","March tests","Repair basics","Memory redundancy"], lab:"Memory fault diagnosis", labType:"tool" },
    { id: 7, level:7, title:"Boundary Scan / JTAG", difficulty:"Advanced", xp:320, hours:6, position:"left", topics:["TAP controller","IEEE 1149.1","Board testing","Debug access"], lab:"JTAG chain debug", labType:"challenge" },
    { id: 8, level:8, title:"Diagnosis + Silicon Bring-up", difficulty:"Advanced", xp:360, hours:9, position:"center", topics:["Failure logs","Diagnosis flow","Tester correlation","Lab debug"], lab:"Locate failing block", labType:"project" },
    { id: 9, level:9, title:"Real Industry Projects", difficulty:"Advanced", xp:450, hours:14, position:"right", topics:["CPU core scan insertion","SRAM MBIST plan","JTAG subsystem","ATPG flow setup"], lab:"Choose 1 industry project", labType:"capstone" },
    { id: 10, level:10, title:"Automation + Scripting", difficulty:"Advanced", xp:380, hours:6, position:"center", topics:["Tcl flows","Reports parsing","Regression automation"], lab:"Automate coverage report", labType:"coding" },
    { id: 11, level:11, title:"Placement Readiness", difficulty:"Expert", xp:600, hours:10, position:"left", topics:["Resume","DFT interview prep","Scan questions","ATPG scenarios"], lab:"Mock interview + resume review", labType:"career", companies:["Qualcomm","Intel","NVIDIA","AMD","MediaTek","Synopsys","Siemens EDA"] },
    { id: 12, level:12, title:"Final Boss — DFT Architect", difficulty:"Elite", xp:1200, hours:18, position:"center", topics:["Full chip DFT architecture","Scan + MBIST + JTAG","Coverage goals","Silicon validation"], lab:"Plan full chip DFT architecture", labType:"boss", badge:"DFT Architect" },
  ],
  research: [
    { id: 0, level:0, title:"Research Foundations", difficulty:"Beginner", xp:50, hours:2, position:"center", topics:["What is semiconductor research","Academia vs industry R&D","Patent mindset","Reading papers","Technology roadmaps"], lab:"Analyze a research abstract", labType:"analysis" },
    { id: 1, level:1, title:"Device Physics Core", difficulty:"Beginner", xp:110, hours:5, position:"right", topics:["PN junction","MOS electrostatics","Carrier transport","Tunneling basics","Scaling laws"], lab:"Threshold voltage trend analysis", labType:"simulation" },
    { id: 2, level:2, title:"CMOS Scaling Challenges", difficulty:"Beginner+", xp:150, hours:6, position:"center", topics:["Short channel effects","Leakage","Variability","Power density","Interconnect delay"], lab:"Node comparison study", labType:"study" },
    { id: 3, level:3, title:"FinFET / GAA Era", difficulty:"Intermediate", xp:220, hours:7, position:"left", topics:["FinFET structure","Nanosheet FET","Gate-all-around","Electrostatic control"], lab:"Compare subthreshold swing", labType:"simulation" },
    { id: 4, level:4, title:"TFET + Beyond CMOS", difficulty:"Intermediate", xp:260, hours:8, position:"center", topics:["Band-to-band tunneling","TFET operation","Steep slope devices","Low power logic"], lab:"Device concept selection", labType:"design" },
    { id: 5, level:5, title:"TCAD Simulation", difficulty:"Intermediate", xp:300, hours:9, position:"right", topics:["Process simulation","Device simulation","Doping profiles","IV curves","Calibration basics"], lab:"Run mock TCAD workflow", labType:"tool" },
    { id: 6, level:6, title:"Memory + Compute Trends", difficulty:"Intermediate+", xp:320, hours:7, position:"center", topics:["SRAM scaling","MRAM","ReRAM","Compute-in-memory"], lab:"Choose memory for AI edge chip", labType:"design" },
    { id: 7, level:7, title:"AI Hardware Research", difficulty:"Advanced", xp:360, hours:8, position:"left", topics:["Accelerators","Systolic arrays","NPU design","Sparsity hardware","Edge AI constraints"], lab:"Map CNN on accelerator", labType:"project" },
    { id: 8, level:8, title:"Advanced Packaging", difficulty:"Advanced", xp:400, hours:9, position:"center", topics:["Chiplets","2.5D / 3D IC","TSV","Thermal issues","Heterogeneous integration"], lab:"Chiplet partition strategy", labType:"design" },
    { id: 9, level:9, title:"Publications + Patents", difficulty:"Advanced", xp:450, hours:10, position:"right", topics:["Novelty finding","Claims writing","Paper structure","Experiments","Citation strategy"], lab:"Draft paper title + novelty statement", labType:"writing" },
    { id: 10, level:10, title:"Real Research Projects", difficulty:"Advanced", xp:520, hours:14, position:"center", topics:["TFET low power device","AI accelerator architecture","Chiplet interconnect","Memory innovation","GAA variability study"], lab:"Choose and begin your research track", labType:"capstone" },
    { id: 11, level:11, title:"Career Readiness", difficulty:"Expert", xp:650, hours:10, position:"left", topics:["MS/PhD applications","R&D interviews","Research portfolio","Conference presentation"], lab:"Build research portfolio", labType:"career", companies:["Intel Labs","TSMC","IMEC","MediaTek","Samsung Research","NVIDIA Research","IBM Research"] },
    { id: 12, level:12, title:"Final Boss — Silicon Innovator", difficulty:"Elite", xp:1500, hours:20, position:"center", topics:["Novel semiconductor idea","Architecture/device justification","Metrics definition","Publication roadmap"], lab:"Propose novel semiconductor concept with full justification", labType:"boss", badge:"Silicon Innovator" },
  ]
};

export const DOMAIN_LIST = [
  {
    id: "rtl", name: "RTL Design", iconType: "rtl", color: "#00f5ff",
    tagline: "Design digital hardware using Verilog/SystemVerilog.",
    salaryMin: 6, salaryMax: 22, salaryDisplay: "₹6 – ₹22 LPA",
    roadmap: "4–8 Months", roadmapMonths: 6, difficulty: 2, difficultyLabel: "Medium",
    prereqs: ["Digital Logic", "Verilog"],
    companies: ["Qualcomm", "Intel", "AMD", "MediaTek"],
    route: "/path/rtl", btnLabel: "Explore RTL Path",
    tags: ["beginner", "coding"], recommended: "ECE Student",
  },
  {
    id: "verification", name: "Verification", iconType: "verification", color: "#a855f7",
    tagline: "Verify chip functionality before fabrication.",
    salaryMin: 7, salaryMax: 28, salaryDisplay: "₹7 – ₹28 LPA",
    roadmap: "6–10 Months", roadmapMonths: 8, difficulty: 3, difficultyLabel: "Medium-High",
    prereqs: ["RTL Basics", "SystemVerilog"],
    companies: ["NVIDIA", "Intel", "MediaTek", "Synopsys", "Cadence"],
    route: "/path/verification", btnLabel: "Explore Verification Path",
    tags: ["coding"], recommended: "Coder",
  },
  {
    id: "physical-design", name: "Physical Design", iconType: "pd", color: "#3b82f6",
    tagline: "Transform RTL into silicon-ready chip layout.",
    salaryMin: 8, salaryMax: 30, salaryDisplay: "₹8 – ₹30 LPA",
    roadmap: "8–12 Months", roadmapMonths: 10, difficulty: 4, difficultyLabel: "High",
    prereqs: ["ASIC Flow", "Linux", "STA"],
    companies: ["Qualcomm", "Apple", "MediaTek", "Intel", "NVIDIA"],
    route: "/path/physical-design", btnLabel: "Explore PD Path",
    tags: ["hardware"], recommended: "Design Oriented",
  },
  {
    id: "analog", name: "Analog IC Design", iconType: "analog", color: "#f59e0b",
    tagline: "Design amplifiers, PLLs, ADCs, DACs.",
    salaryMin: 10, salaryMax: 35, salaryDisplay: "₹10 – ₹35 LPA",
    roadmap: "10–18 Months", roadmapMonths: 14, difficulty: 5, difficultyLabel: "Very High",
    prereqs: ["Analog Electronics", "MOS Physics"],
    companies: ["Texas Instruments", "ADI", "MediaTek", "Qualcomm"],
    route: "/path/analog", btnLabel: "Explore Analog Path",
    tags: ["hardware"], recommended: "Circuits Lover",
  },
  {
    id: "fpga", name: "FPGA Design", iconType: "fpga", color: "#10b981",
    tagline: "Build hardware on reconfigurable programmable chips.",
    salaryMin: 6, salaryMax: 20, salaryDisplay: "₹6 – ₹20 LPA",
    roadmap: "4–7 Months", roadmapMonths: 5, difficulty: 2, difficultyLabel: "Medium",
    prereqs: ["Verilog", "Digital Logic"],
    companies: ["AMD Xilinx", "Lattice", "Intel PSG", "MediaTek"],
    route: "/path/fpga", btnLabel: "Explore FPGA Path",
    tags: ["beginner", "hardware"], recommended: null,
  },
  {
    id: "dft", name: "DFT", iconType: "dft", color: "#ec4899",
    tagline: "Insert test logic for chip manufacturability.",
    salaryMin: 8, salaryMax: 25, salaryDisplay: "₹8 – ₹25 LPA",
    roadmap: "6–9 Months", roadmapMonths: 7, difficulty: 3, difficultyLabel: "Medium-High",
    prereqs: ["Digital Design", "Scan Concepts"],
    companies: ["Synopsys", "Siemens Tessent", "Qualcomm", "MediaTek"],
    route: "/path/dft", btnLabel: "Explore DFT Path",
    tags: ["hardware"], recommended: null,
  },
  {
    id: "embedded", name: "Embedded Systems", iconType: "embedded", color: "#f97316",
    tagline: "Hardware + firmware integration for products.",
    salaryMin: 5, salaryMax: 22, salaryDisplay: "₹5 – ₹22 LPA",
    roadmap: "4–8 Months", roadmapMonths: 6, difficulty: 2, difficultyLabel: "Medium",
    prereqs: ["C", "Controllers", "Interfaces"],
    companies: ["Bosch", "Qualcomm", "TI", "MediaTek"],
    route: "/path/embedded", btnLabel: "Explore Embedded Path",
    tags: ["beginner", "coding"], recommended: null,
  },
  {
    id: "research", name: "Semiconductor Research", iconType: "research", color: "#fbbf24",
    tagline: "Work on TFET, GAA, AI accelerators, advanced nodes.",
    salaryMin: 10, salaryMax: 40, salaryDisplay: "₹10 – ₹40+ LPA",
    roadmap: "Long Term", roadmapMonths: 36, difficulty: 6, difficultyLabel: "Elite",
    prereqs: ["Strong fundamentals", "Research mindset"],
    companies: ["TSMC", "Intel", "IMEC", "MediaTek", "Samsung"],
    route: "/path/research", btnLabel: "Explore Research Path",
    tags: ["research"], recommended: null,
  },
];
// ─── RESEARCH SUB-LEVELS ─────────────────────────────────────────────────────
// Add this to your data.ts file after the existing ROADMAPS export

export type SubLevelType = "background" | "techniques" | "angles" | "paper";

export type SubLevel = {
  id: string;
  type: SubLevelType;
  title: string;
  icon: string;
  summary: string;
  keyPoints: string[];
  deepDive: string;
  xp: number;
  quiz: { q: string; options: string[]; answer: number }[];
};

export type ResearchLevelData = {
  levelId: number;
  subLevels: SubLevel[];
  bonusXp: number;
  badge: string;
};

export const RESEARCH_SUB_LEVELS: ResearchLevelData[] = [
  // ── Level 0: Research Foundations ──────────────────────────────────────────
  {
    levelId: 0,
    bonusXp: 100,
    badge: "Research Initiate",
    subLevels: [
      {
        id: "0-bg", type: "background", title: "Background", icon: "📚",
        summary: "The history and landscape of semiconductor research from Bell Labs to today.",
        keyPoints: [
          "Bell Labs invented the transistor in 1947 — started modern semiconductor era",
          "Moore's Law (1965) predicted transistor count doubling every ~2 years",
          "VLSI research split into device, circuit, architecture, and systems layers",
          "Academia focuses on novel devices; industry focuses on manufacturability",
          "ITRS (now IRDS) provides the global semiconductor roadmap",
        ],
        deepDive: "Semiconductor research began with the invention of the point-contact transistor at Bell Laboratories in 1947 by Shockley, Bardeen, and Brattain. This singular event triggered a cascade of innovations — the integrated circuit (Kilby/Noyce, 1958), CMOS logic (Wanlass, 1963), and eventually the microprocessor (Intel 4004, 1971). Today, research spans device physics, process technology, circuit design, computer architecture, and packaging — all interconnected and pushing the boundaries of what silicon can do.",
        xp: 30,
        quiz: [
          { q: "Who invented the transistor at Bell Labs?", options: ["Turing and Von Neumann", "Shockley, Bardeen, and Brattain", "Kilby and Noyce", "Moore and Grove"], answer: 1 },
          { q: "What does IRDS stand for?", options: ["International Research on Device Scaling", "International Roadmap for Devices and Systems", "Integrated Research and Design Standards", "Institute for Research in Device Science"], answer: 1 },
          { q: "Moore's Law originally stated transistor count doubles every:", options: ["6 months", "1 year", "~2 years", "5 years"], answer: 2 },
        ],
      },
      {
        id: "0-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "How modern semiconductor research is conducted — tools, methodologies, and workflows.",
        keyPoints: [
          "TCAD simulation used to model devices before fabrication",
          "First-principles DFT calculations for material properties",
          "Machine learning increasingly used for process optimization",
          "Cleanroom fabrication required for experimental devices",
          "Characterization tools: SEM, TEM, SIMS, C-V, I-V",
        ],
        deepDive: "Modern semiconductor research uses a combination of simulation, fabrication, and characterization. TCAD tools like Synopsys Sentaurus simulate process steps and device behavior without costly wafer runs. First-principles calculations using Density Functional Theory (DFT) predict material properties from quantum mechanics. Characterization requires advanced microscopy (TEM for atomic-level imaging), spectroscopy (SIMS for dopant profiles), and electrical testing (I-V, C-V curves). Machine learning is now being applied to predict optimal process conditions and identify defect patterns.",
        xp: 30,
        quiz: [
          { q: "What does TCAD stand for?", options: ["Technology Computer-Aided Design", "Transistor Circuit Analysis and Design", "Thin Channel Advanced Devices", "Thermal Characterization and Design"], answer: 0 },
          { q: "Which technique images atomic-level structure?", options: ["SEM", "SIMS", "TEM", "XRD"], answer: 2 },
          { q: "DFT in material research stands for:", options: ["Design Flow Toolkit", "Density Functional Theory", "Device Fabrication Techniques", "Digital Filter Transform"], answer: 1 },
        ],
      },
      {
        id: "0-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Open problems and innovation opportunities in semiconductor research today.",
        keyPoints: [
          "Post-silicon materials: GaN, SiC, 2D materials (MoS2, WSe2)",
          "3D integration and heterogeneous chiplet architectures",
          "Neuromorphic and in-memory computing paradigms",
          "Quantum computing hardware on silicon",
          "Ultra-low power design for IoT and edge AI",
        ],
        deepDive: "The semiconductor research community is actively pursuing multiple breakthroughs. As silicon CMOS approaches fundamental limits, wide-bandgap semiconductors like GaN and SiC are enabling power electronics beyond silicon's capabilities. 2D materials offer atomic-thin channels with exceptional electrostatic control. 3D integration stacks compute and memory to overcome the memory wall. Neuromorphic chips mimic brain-like computing for energy-efficient AI. Each of these represents a distinct research angle with high industry relevance.",
        xp: 30,
        quiz: [
          { q: "Which is a 2D material used in research transistors?", options: ["Silicon", "Germanium", "MoS2", "GaAs"], answer: 2 },
          { q: "What is the 'memory wall' problem?", options: ["Physical memory chip size limits", "Speed gap between processor and memory", "Memory cell leakage", "Memory write failures"], answer: 1 },
          { q: "Neuromorphic computing mimics:", options: ["Von Neumann architecture", "Quantum circuits", "Brain-like neural networks", "RISC processors"], answer: 2 },
        ],
      },
      {
        id: "0-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "How to read, analyze, and extract value from semiconductor research papers.",
        keyPoints: [
          "Read abstract → introduction → results → conclusion first",
          "Check figures and graphs before reading full text",
          "Understand the novelty claim and compare to prior work",
          "Look at the device metrics: ION/IOFF, SS, DIBL, mobility",
          "Check fabrication process and characterization methods",
        ],
        deepDive: "Reading research papers efficiently is a critical skill. Start with the abstract to understand the contribution, then jump to the results figures — these contain the core data. The introduction explains why the problem matters and what was done before. The methodology section details how experiments were conducted. For device papers, key metrics include: ON/OFF current ratio (ION/IOFF), subthreshold swing (SS, ideal = 60 mV/dec), drain-induced barrier lowering (DIBL), and carrier mobility. Always check if claims are supported by measured data vs simulation.",
        xp: 30,
        quiz: [
          { q: "What is the ideal subthreshold swing (SS) limit?", options: ["10 mV/dec", "60 mV/dec", "100 mV/dec", "200 mV/dec"], answer: 1 },
          { q: "DIBL stands for:", options: ["Drain-Induced Barrier Lowering", "Device Interface Body Leakage", "Differential Input Bias Level", "Deep Ion Beam Lithography"], answer: 0 },
          { q: "Which section of a paper describes HOW experiments were done?", options: ["Abstract", "Introduction", "Methods/Fabrication", "Conclusion"], answer: 2 },
        ],
      },
    ],
  },

  // ── Level 1: Device Physics Core ───────────────────────────────────────────
  {
    levelId: 1,
    bonusXp: 120,
    badge: "Device Physics Scholar",
    subLevels: [
      {
        id: "1-bg", type: "background", title: "Background", icon: "📚",
        summary: "Quantum mechanics foundations and semiconductor band theory.",
        keyPoints: [
          "Electrons in solids occupy energy bands — conduction and valence bands",
          "Bandgap determines if material is conductor, semiconductor, or insulator",
          "Silicon bandgap: 1.12 eV — suitable for room temperature operation",
          "Fermi level determines carrier concentration",
          "Intrinsic carriers generated by thermal excitation across bandgap",
        ],
        deepDive: "In crystalline solids, atomic orbitals overlap to form continuous energy bands. The valence band is filled with electrons; the conduction band is mostly empty. The energy gap between them — the bandgap — determines electrical behavior. Silicon's 1.12 eV bandgap is ideal: wide enough to minimize leakage at room temperature, narrow enough to allow doping and carrier generation. The Fermi level represents the energy at which electron occupation probability is 50%. Doping shifts the Fermi level — n-type moves it toward the conduction band, p-type toward the valence band.",
        xp: 35,
        quiz: [
          { q: "Silicon's bandgap at room temperature is approximately:", options: ["0.67 eV", "1.12 eV", "1.42 eV", "3.37 eV"], answer: 1 },
          { q: "What does n-type doping do to the Fermi level?", options: ["Moves it toward valence band", "Moves it toward conduction band", "Keeps it centered", "Eliminates it"], answer: 1 },
          { q: "Intrinsic carriers in silicon are generated by:", options: ["Applied voltage", "Thermal excitation across bandgap", "Doping", "Light exposure only"], answer: 1 },
        ],
      },
      {
        id: "1-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "How modern device physics is measured and characterized.",
        keyPoints: [
          "I-V characterization reveals carrier transport mechanisms",
          "C-V measurements extract oxide thickness, doping, and interface traps",
          "Hall effect measurements determine carrier mobility",
          "Noise spectroscopy reveals defect density",
          "TCAD calibration against experimental data",
        ],
        deepDive: "Device characterization combines electrical and physical measurements. I-V (current-voltage) curves reveal how a transistor switches — plotting drain current vs gate voltage shows threshold voltage, subthreshold swing, and ON current. C-V (capacitance-voltage) measurements probe the MOS capacitor structure, extracting oxide thickness (Cox), flatband voltage, and interface trap density (Dit). The Hall effect measures carrier mobility by combining resistivity with a magnetic field. These measurements feed back into TCAD models for predictive simulation of future devices.",
        xp: 35,
        quiz: [
          { q: "Which measurement extracts threshold voltage?", options: ["C-V", "Hall effect", "I-V (drain current vs gate voltage)", "Noise spectroscopy"], answer: 2 },
          { q: "Hall effect measurement determines:", options: ["Bandgap", "Carrier mobility", "Oxide thickness", "Subthreshold swing"], answer: 1 },
          { q: "Interface trap density (Dit) is extracted from:", options: ["I-V curves", "Hall measurements", "C-V measurements", "TEM imaging"], answer: 2 },
        ],
      },
      {
        id: "1-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Open problems in device physics driving current research.",
        keyPoints: [
          "Carrier transport in sub-5nm channels — quantum effects dominate",
          "Interface quality in high-k/metal gate stacks",
          "Variability — random dopant fluctuations at atomic scale",
          "Self-heating effects in fin and nanosheet structures",
          "New channel materials: Ge, III-V, 2D semiconductors",
        ],
        deepDive: "As transistors shrink below 5nm, classical drift-diffusion transport breaks down and quantum mechanical effects — tunneling, quantization, scattering — dominate. Interface quality between high-k dielectrics and metal gates critically affects mobility. Random dopant fluctuations (RDF) cause transistor-to-transistor variability that degrades circuit performance. Self-heating in confined geometries like FinFETs reduces carrier mobility. These fundamental physics challenges motivate research into new channel materials with higher mobility and better electrostatic control.",
        xp: 35,
        quiz: [
          { q: "What causes transistor-to-transistor variability at nanoscale?", options: ["Process temperature", "Random dopant fluctuations", "Clock frequency", "Power supply noise"], answer: 1 },
          { q: "Below which channel length do quantum effects become dominant?", options: ["100nm", "50nm", "~5nm", "1μm"], answer: 2 },
          { q: "Why are new channel materials like Ge being researched?", options: ["Cheaper manufacturing", "Higher carrier mobility than silicon", "Better thermal conductivity", "Easier doping"], answer: 1 },
        ],
      },
      {
        id: "1-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "Landmark device physics papers and how to analyze them.",
        keyPoints: [
          "Dennard Scaling (1974) — foundation of CMOS scaling theory",
          "Taur et al. (1997) — CMOS scaling into nanometer regime",
          "Hisamoto et al. (2000) — original FinFET paper from UC Berkeley",
          "Key metric to track: SS, DIBL, ION/IOFF, VT",
          "Compare new device to silicon baseline always",
        ],
        deepDive: "The FinFET paper by Hisamoto et al. (2000) is a landmark — it proposed a fully-depleted double-gate transistor with a fin-shaped channel, achieving excellent electrostatic control. When reading device papers, always note: (1) What problem does this solve vs planar MOSFET? (2) What fabrication steps are novel? (3) Are results from simulation or measured silicon? (4) How do key metrics (SS, DIBL, ION/IOFF) compare to state-of-the-art? Papers that achieve SS below 60 mV/dec claim tunnel FET or negative capacitance behavior — verify carefully.",
        xp: 35,
        quiz: [
          { q: "What is the significance of the FinFET (Hisamoto 2000)?", options: ["First silicon transistor", "3D fin-shaped channel for better electrostatic control", "First low-power SRAM", "First GaN device"], answer: 1 },
          { q: "Dennard Scaling assumes that as transistors shrink:", options: ["Power increases", "Power density stays constant", "Speed decreases", "Leakage disappears"], answer: 1 },
          { q: "SS below 60 mV/dec in a paper suggests:", options: ["Better silicon MOSFET", "Tunnel FET or negative capacitance device", "Measurement error", "High temperature operation"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 2: CMOS Scaling Challenges ───────────────────────────────────────
  {
    levelId: 2,
    bonusXp: 130,
    badge: "Scaling Expert",
    subLevels: [
      {
        id: "2-bg", type: "background", title: "Background", icon: "📚",
        summary: "The history of CMOS scaling and how we got to today's challenges.",
        keyPoints: [
          "Dennard Scaling era: shrinking reduced power, improved speed",
          "Dennard Scaling broke ~2005 due to leakage and power density",
          "Multicore processors emerged to continue performance scaling",
          "FinFET at 22nm (Intel, 2011) revived electrostatic control",
          "Today: 3nm GAA (Samsung, TSMC) — approaching atomic limits",
        ],
        deepDive: "For decades, shrinking transistors made chips faster AND more power-efficient — this was Dennard Scaling. By 2005, leakage current and power density broke this relationship. The industry responded with multicore processors, strained silicon, high-k dielectrics, and eventually FinFETs. Each node transition required new materials and processes. Today at 2-3nm, gate-all-around (GAA) nanosheet transistors provide even better electrostatic control than FinFETs. But fundamental limits — quantum tunneling through ultra-thin oxides, atomic-scale dopant placement — mean purely geometric scaling is approaching its end.",
        xp: 40,
        quiz: [
          { q: "Dennard Scaling broke around which year?", options: ["1990", "1995", "2005", "2015"], answer: 2 },
          { q: "Intel introduced FinFETs commercially at which node?", options: ["45nm", "32nm", "22nm", "14nm"], answer: 2 },
          { q: "What replaced FinFETs at 3nm nodes?", options: ["Planar MOSFET", "Gate-All-Around (GAA) nanosheet", "TFET", "SOI devices"], answer: 1 },
        ],
      },
      {
        id: "2-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "Engineering solutions to scaling challenges used in modern fabs.",
        keyPoints: [
          "Strain engineering — biaxial tensile strain improves electron mobility",
          "High-k/metal gate — replaced SiO2 to reduce gate leakage",
          "Fin shape optimization — controls short channel effects",
          "EUV lithography enables sub-10nm patterning",
          "Multi-patterning combines multiple exposures for tight pitches",
        ],
        deepDive: "The semiconductor industry solved each scaling challenge with materials and process innovation. Strained silicon (Intel, 90nm, 2003) applies mechanical stress to the channel, boosting carrier mobility by 20-50%. High-k/metal gate (Intel, 45nm, 2007) replaced the thermally grown SiO2 gate dielectric with HfO2, dramatically reducing gate leakage while maintaining capacitance. EUV (Extreme Ultraviolet) lithography at 13.5nm wavelength enables direct patterning of features below 10nm. These innovations extended Moore's Law by addressing physics limits through materials engineering.",
        xp: 40,
        quiz: [
          { q: "Strain engineering primarily improves:", options: ["Gate dielectric quality", "Carrier mobility", "Metal contact resistance", "Isolation between transistors"], answer: 1 },
          { q: "High-k dielectric was introduced to reduce:", options: ["Contact resistance", "Junction leakage", "Gate dielectric leakage", "Channel resistance"], answer: 2 },
          { q: "EUV lithography uses a wavelength of:", options: ["193nm", "13.5nm", "248nm", "365nm"], answer: 1 },
        ],
      },
      {
        id: "2-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Active research directions addressing the end of traditional scaling.",
        keyPoints: [
          "Complementary FET (CFET) — stacks n and p FETs vertically",
          "Backside power delivery networks — frees frontside for logic",
          "2D material FETs — atomic layer thickness for ultimate scaling",
          "Negative capacitance FETs — bypass 60 mV/dec limit",
          "Die stacking and 3D integration as system-level scaling",
        ],
        deepDive: "Research is pursuing multiple 'more-than-Moore' directions. Complementary FET (CFET) stacks n-type and p-type transistors vertically in the same footprint, doubling logic density. Backside power delivery networks (BSPDN) move power rails to the wafer backside, freeing routing resources and reducing IR drop. 2D materials like MoS2 offer channel thicknesses of single atomic layers — ultimate electrostatic control. Negative capacitance (NC) FETs using ferroelectric gate insulators can achieve SS below 60 mV/dec, promising lower operating voltage. Each represents a distinct research opportunity.",
        xp: 40,
        quiz: [
          { q: "CFET (Complementary FET) stacks:", options: ["Two n-type FETs", "n-type and p-type FETs vertically", "Memory and logic", "Two gate stacks"], answer: 1 },
          { q: "Backside power delivery networks benefit by:", options: ["Reducing transistor count", "Freeing frontside routing for logic", "Improving gate dielectric", "Reducing threshold voltage"], answer: 1 },
          { q: "Negative capacitance FETs can achieve SS:", options: ["Above 60 mV/dec", "Exactly 60 mV/dec", "Below 60 mV/dec", "Zero"], answer: 2 },
        ],
      },
      {
        id: "2-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "How to read and evaluate CMOS scaling research papers.",
        keyPoints: [
          "Node naming is now marketing — 3nm ≠ 3nm physical gate length",
          "Compare: physical gate length, contacted poly pitch, cell height",
          "PPAC = Power, Performance, Area, Cost — the 4 metrics",
          "Technology boosters: stressor, epitaxy, self-aligned contacts",
          "Benchmark against ITRS/IRDS roadmap targets",
        ],
        deepDive: "Modern technology papers from Intel, TSMC, and Samsung use marketing node names (3nm, 2nm) that don't correspond to physical dimensions. When evaluating papers, focus on physical metrics: contacted poly pitch (CPP), metal pitch, standard cell height, and effective transistor width. PPAC (Power, Performance, Area, Cost) is the industry framework for evaluating any new technology. A new device must improve at least one PPAC metric without degrading others. The IRDS roadmap provides target specifications for each future node — compare new research against these benchmarks.",
        xp: 40,
        quiz: [
          { q: "PPAC in semiconductor technology stands for:", options: ["Process, Performance, Architecture, Characterization", "Power, Performance, Area, Cost", "Patterning, Placement, Alignment, Calibration", "Physics, Process, Analysis, Control"], answer: 1 },
          { q: "CPP (Contacted Poly Pitch) is a measure of:", options: ["Transistor speed", "Physical transistor density", "Power consumption", "Metal routing density"], answer: 1 },
          { q: "IRDS is used to:", options: ["Verify chip designs", "Provide future technology roadmap targets", "Certify research labs", "License semiconductor IP"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 3: FinFET / GAA Era ───────────────────────────────────────────────
  {
    levelId: 3,
    bonusXp: 150,
    badge: "3D Device Specialist",
    subLevels: [
      {
        id: "3-bg", type: "background", title: "Background", icon: "📚",
        summary: "Evolution from planar MOSFET to FinFET to Gate-All-Around.",
        keyPoints: [
          "Planar MOSFET lost gate control at <20nm — short channel effects",
          "FinFET wraps gate on 3 sides of a vertical fin — better control",
          "GAA nanosheet wraps gate on all 4 sides — maximum control",
          "Electrostatic control measured by DIBL and subthreshold swing",
          "TSMC/Samsung at 3nm GAA; Intel RibbonFET is their GAA variant",
        ],
        deepDive: "The evolution from planar to 3D transistors was driven by electrostatic necessity. In a planar MOSFET, the gate controls only the top surface of the channel — as the gate length shrinks, the source and drain electric fields increasingly influence the channel, causing short-channel effects. The FinFET solution wraps the gate around three sides of a thin silicon fin, providing much better electrostatic control. Gate-All-Around (GAA) nanosheet FETs take this further — the gate completely surrounds the channel on all four sides. This maximizes gate control and minimizes DIBL, enabling continued scaling below 5nm.",
        xp: 45,
        quiz: [
          { q: "Why did planar MOSFETs fail below 20nm?", options: ["Too expensive", "Lost gate electrostatic control", "Too slow", "High mobility"], answer: 1 },
          { q: "A FinFET gate wraps around how many sides of the channel?", options: ["1", "2", "3", "4"], answer: 2 },
          { q: "GAA nanosheet provides gate control from:", options: ["1 side", "2 sides", "3 sides", "All 4 sides"], answer: 3 },
        ],
      },
      {
        id: "3-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "Fabrication processes for FinFET and GAA devices.",
        keyPoints: [
          "Fin formation via self-aligned multiple patterning",
          "Fin height and width determine drive current and SS",
          "Nanosheet release etch removes sacrificial SiGe layers",
          "Inner spacers prevent parasitic capacitance in GAA",
          "Gate replacement process (high-k last) for better reliability",
        ],
        deepDive: "FinFET fabrication starts with patterning silicon fins using self-aligned multiple patterning. Fin dimensions (height and width) directly determine transistor characteristics — taller fins give more current but less control. For GAA nanosheets, epitaxially grown alternating Si/SiGe layers are first deposited. After gate patterning, the SiGe sacrificial layers are selectively etched away, releasing the Si nanosheets. The gate dielectric and metal are then deposited in the gaps. Inner spacers, formed between nanosheets, are critical for reducing parasitic capacitance between gate and source/drain contacts.",
        xp: 45,
        quiz: [
          { q: "In GAA fabrication, what are SiGe layers used for?", options: ["Channel material", "Sacrificial layers that are later removed", "Gate metal", "Dopant source"], answer: 1 },
          { q: "Inner spacers in GAA FETs reduce:", options: ["Channel resistance", "Parasitic gate-to-source/drain capacitance", "Threshold voltage", "Leakage current"], answer: 1 },
          { q: "Gate replacement process deposits high-k dielectric:", options: ["Before source/drain formation", "After all other processing (last)", "Before fin formation", "During epitaxy"], answer: 1 },
        ],
      },
      {
        id: "3-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Next-generation device research beyond current GAA.",
        keyPoints: [
          "Forksheet FET — n and p transistors share gate, no isolation space needed",
          "CFET — n on top of p for smallest possible logic cell",
          "2D material nanosheets — MoS2 channels at 0.65nm thickness",
          "Ferroelectric HZO gate — negative capacitance for steep slope",
          "Vertical transport FET — current flows vertically through channel",
        ],
        deepDive: "Beyond GAA, the research community is exploring even more compact structures. The Forksheet FET (imec) places n-type and p-type nanosheets in a shared gate structure separated only by a dielectric wall, eliminating the n-to-p spacing and enabling ~20% density improvement. CFET (Complementary FET) stacks p-type nanosheets directly on top of n-type nanosheets in the same gate stack — theoretically halving the logic cell area. Ferroelectric HfZrO2 (HZO) as the gate dielectric enables negative capacitance, amplifying the gate voltage and achieving SS below the 60 mV/dec Boltzmann limit.",
        xp: 45,
        quiz: [
          { q: "What does CFET achieve compared to GAA?", options: ["Higher drive current", "Stacked n and p transistors for ~50% area reduction", "Lower threshold voltage", "Higher operating frequency"], answer: 1 },
          { q: "MoS2 as a channel material offers what key advantage?", options: ["Lower cost", "Atomic-scale thickness (~0.65nm) for ultimate gate control", "Higher thermal conductivity", "Easier doping"], answer: 1 },
          { q: "Ferroelectric gate dielectrics enable SS:", options: ["Above 60 mV/dec", "Exactly 60 mV/dec", "Below 60 mV/dec (steep slope)", "Infinite SS"], answer: 2 },
        ],
      },
      {
        id: "3-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "Key GAA and FinFET papers and how to evaluate them.",
        keyPoints: [
          "Hisamoto et al. IEDM 2000 — original FinFET proposal",
          "TSMC 3nm N3 process — first commercial GAA? No — still FinFET",
          "Samsung 3GAE — first commercial GAA nanosheet (2022)",
          "imec Forksheet IEDM 2019 — proposed device concept",
          "Key: always check if fabricated device or simulation only",
        ],
        deepDive: "When reading FinFET/GAA papers, distinguish between: (1) device concept papers — propose a new structure, often with TCAD simulation only; (2) process demonstration papers — show actual fabricated devices with measured electrical data; (3) technology node papers — describe a production-ready process with full statistical characterization. Samsung's 3GAE (2022) was the first production GAA nanosheet, but TSMC's 3nm remained FinFET. The IEDM and VLSI conferences are the premier venues — papers there are highly reviewed and represent state-of-the-art.",
        xp: 45,
        quiz: [
          { q: "Which company released the first commercial GAA nanosheet process?", options: ["Intel", "TSMC", "Samsung", "GlobalFoundries"], answer: 2 },
          { q: "IEDM is:", options: ["A semiconductor equipment company", "International Electron Devices Meeting — top device conference", "An EDA tool", "A materials standard"], answer: 1 },
          { q: "A 'process demonstration paper' differs from a 'concept paper' by:", options: ["Being longer", "Showing actual fabricated and measured devices", "Using better simulations", "Having more authors"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 4: TFET + Beyond CMOS ─────────────────────────────────────────────
  {
    levelId: 4,
    bonusXp: 160,
    badge: "Beyond-CMOS Pioneer",
    subLevels: [
      {
        id: "4-bg", type: "background", title: "Background", icon: "📚",
        summary: "Why we need beyond-CMOS devices and the fundamental 60 mV/dec limit.",
        keyPoints: [
          "Boltzmann tyranny: minimum SS = 60 mV/dec at room temperature",
          "This limits how much we can reduce supply voltage (VDD)",
          "Lower VDD → exponentially lower power (P ∝ CV²f)",
          "Beyond-CMOS explores new switching mechanisms",
          "Goal: steep-slope (<60 mV/dec) low-power logic",
        ],
        deepDive: "The subthreshold swing (SS) of a conventional MOSFET is fundamentally limited to 60 mV/dec at room temperature by the Boltzmann distribution of thermal carriers. This 'Boltzmann tyranny' means you need at least 60mV of gate voltage change to change drain current by 10x. This limits VDD reduction — to maintain noise margins, VDD cannot scale as fast as transistors. Since dynamic power P ∝ CV²f, this limits power reduction. Beyond-CMOS devices seek new switching mechanisms — tunneling, ferroelectric polarization reversal, phase transitions — to break this limit.",
        xp: 48,
        quiz: [
          { q: "The Boltzmann limit for SS at room temperature is:", options: ["6 mV/dec", "60 mV/dec", "600 mV/dec", "6000 mV/dec"], answer: 1 },
          { q: "Dynamic power in CMOS scales as:", options: ["P ∝ CV²f", "P ∝ I²R", "P ∝ VDD/f", "P ∝ C/V"], answer: 0 },
          { q: "TFET uses which mechanism to switch?", options: ["Drift-diffusion", "Band-to-band tunneling", "Thermionic emission", "Impact ionization"], answer: 1 },
        ],
      },
      {
        id: "4-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "Current fabrication and characterization of steep-slope devices.",
        keyPoints: [
          "TFET: reverse-biased p-i-n with gate over intrinsic region",
          "Line tunneling vs point tunneling geometries",
          "Heterojunction TFETs use GeSn/Si for lower bandgap",
          "Ferroelectric FET: HfZrO2 gate with hysteresis",
          "Ambipolar behavior — key challenge in TFET design",
        ],
        deepDive: "The Tunnel FET (TFET) has a reverse-biased p-i-n structure — p+ source, intrinsic channel, n+ drain. When gate voltage is applied, band-to-band tunneling (BTBT) occurs at the source-channel junction, injecting carriers. The tunneling probability depends exponentially on the electric field, enabling steep slope. However, TFETs suffer from low ON current — tunneling probability is low even at high fields. Heterojunction TFETs (e.g., GeSn source with Si channel) improve tunneling probability by using a lower-bandgap source. Ambipolar behavior — the device conducting for both polarities — must be suppressed.",
        xp: 48,
        quiz: [
          { q: "TFET's p-i-n structure is:", options: ["Forward biased", "Reverse biased", "Zero biased", "Alternating biased"], answer: 1 },
          { q: "What limits TFET ON current?", options: ["High threshold voltage", "Low tunneling probability", "High channel resistance", "Poor gate control"], answer: 1 },
          { q: "Ambipolar behavior in TFETs means:", options: ["Very high ON current", "Device conducts for both n-type and p-type operation", "Zero leakage", "Temperature independent operation"], answer: 1 },
        ],
      },
      {
        id: "4-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Active research directions in steep-slope and beyond-CMOS devices.",
        keyPoints: [
          "Improving TFET ON current — the central challenge",
          "Phase-transition FETs (MIT devices) using VO2",
          "Spin-based devices — lower energy state switching",
          "Negative capacitance with HfO2-based ferroelectrics",
          "Hybrid CMOS+TFET circuits for selective steep-slope benefit",
        ],
        deepDive: "The core TFET research challenge is boosting ON current without sacrificing steep slope. Approaches include: (1) 2D material TFETs (MoS2/WSe2 heterojunctions) with atomic-thin tunneling junctions; (2) Vertical TFETs where tunneling occurs along the entire junction area; (3) Negative capacitance amplification of the gate voltage using ferroelectric materials. Phase-transition FETs use correlated electron materials (like VO2) that undergo metal-insulator transitions — switching is extremely abrupt but controllability is challenging. Spin-transfer torque devices switch magnetic domains, potentially enabling non-volatile logic.",
        xp: 48,
        quiz: [
          { q: "VO2-based phase transition FETs exploit:", options: ["Tunneling", "Metal-insulator phase transition", "Ferroelectric polarization", "Spin polarization"], answer: 1 },
          { q: "Vertical TFET geometry improves ON current by:", options: ["Using wider bandgap", "Increasing tunneling junction area", "Reducing gate length", "Higher supply voltage"], answer: 1 },
          { q: "NC-FET uses ferroelectric materials to:", options: ["Reduce gate leakage", "Amplify gate voltage via negative capacitance", "Increase threshold voltage", "Reduce channel resistance"], answer: 1 },
        ],
      },
      {
        id: "4-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "How to critically evaluate beyond-CMOS device papers.",
        keyPoints: [
          "Many papers claim SS < 60 mV/dec — verify measurement methodology",
          "Averaged SS vs minimum SS — minimum is easy to cherry-pick",
          "ON current must be compared at same IOFF (iso-IOFF comparison)",
          "Check if steep slope is over several decades of current",
          "Industry viability: CMOS compatibility, yield, reliability",
        ],
        deepDive: "Beyond-CMOS papers require careful critical reading. Claims of SS < 60 mV/dec must be scrutinized: (1) Is it a minimum point SS or averaged over multiple decades? Minimum SS below 60 mV/dec is easy to claim but not meaningful; (2) At what gate voltage range? The benefit must exist over a useful operating range; (3) Iso-IOFF comparison — compare devices at the same OFF current to see real benefit; (4) What is the ON/OFF ratio and absolute ON current? A device with 0.01 pA/μm ION but steep slope is useless for logic. The most credible papers show benchmarking against CMOS on all metrics simultaneously.",
        xp: 48,
        quiz: [
          { q: "Iso-IOFF comparison means:", options: ["Comparing at same ON current", "Comparing at same OFF current", "Comparing at same voltage", "Comparing at same temperature"], answer: 1 },
          { q: "Why is 'minimum SS' less meaningful than 'averaged SS'?", options: ["Minimum SS is harder to measure", "Minimum SS can be cherry-picked; average reflects actual circuit behavior", "Minimum SS is always higher", "Averaged SS requires more measurements"], answer: 1 },
          { q: "A paper showing ION of 0.01 pA/μm with SS=40 mV/dec is:", options: ["Excellent for logic applications", "Poor for logic — ON current is too low despite steep slope", "Good for memory", "The best possible result"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 5: TCAD Simulation ────────────────────────────────────────────────
  {
    levelId: 5,
    bonusXp: 170,
    badge: "TCAD Practitioner",
    subLevels: [
      {
        id: "5-bg", type: "background", title: "Background", icon: "📚",
        summary: "History and role of TCAD in semiconductor research.",
        keyPoints: [
          "TCAD = Technology Computer-Aided Design",
          "Simulates fabrication processes and device behavior",
          "Reduces costly trial-and-error wafer runs",
          "Synopsys Sentaurus and Silvaco Atlas are industry standards",
          "Process + device simulation combined gives full predictive power",
        ],
        deepDive: "TCAD emerged in the 1970s at Stanford (where the SUPREM and PISCES tools originated) to simulate ion implantation and oxidation. Today, TCAD tools solve partial differential equations governing carrier transport (drift-diffusion, hydrodynamic, or Monte Carlo) coupled with Poisson's equation for the electric field. Process simulation models each fabrication step — oxidation, implantation, diffusion, etching, deposition — to predict the final device geometry and doping profile. Device simulation then applies voltages and computes current flow. Calibration against measured data is essential for predictive accuracy.",
        xp: 50,
        quiz: [
          { q: "TCAD tools solve which fundamental equation for electric field?", options: ["Schrödinger equation", "Poisson's equation", "Maxwell's equations", "Navier-Stokes equations"], answer: 1 },
          { q: "What is the primary commercial TCAD tool from Synopsys?", options: ["HSPICE", "Sentaurus", "Virtuoso", "PrimeTime"], answer: 1 },
          { q: "TCAD process simulation models:", options: ["Circuit behavior", "Each fabrication step to predict doping profiles", "Package thermal behavior", "Clock tree synthesis"], answer: 1 },
        ],
      },
      {
        id: "5-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "How TCAD simulations are set up, calibrated, and analyzed.",
        keyPoints: [
          "Process flow: define wafer → etch → deposit → implant → anneal",
          "Device simulation: define contacts, sweep voltage, solve transport",
          "Calibration: match simulated to measured I-V and C-V",
          "Monte Carlo transport for accurate high-energy carrier simulation",
          "Atomistic simulations (DFT) for interface and material properties",
        ],
        deepDive: "A typical TCAD workflow: (1) Process simulation — define the starting substrate, then simulate each process step in sequence: STI formation, gate stack deposition, source/drain implantation, silicidation. The result is a 2D or 3D structure with realistic geometry and doping. (2) Device simulation — apply boundary conditions at contacts, solve drift-diffusion equations self-consistently with Poisson's equation, sweep gate and drain voltages to generate I-V characteristics. (3) Calibration — adjust model parameters (mobility models, interface trap density, doping activation) until simulation matches measured silicon data. Calibrated models can then predict new device variations.",
        xp: 50,
        quiz: [
          { q: "In drift-diffusion TCAD, which equations are solved self-consistently?", options: ["Drift-diffusion + Schrödinger", "Poisson + drift-diffusion", "Maxwell + Navier-Stokes", "Fourier + Boltzmann"], answer: 1 },
          { q: "TCAD calibration involves:", options: ["Adjusting the supply voltage", "Matching simulation to measured I-V/C-V by tuning model parameters", "Changing the device geometry only", "Running more process steps"], answer: 1 },
          { q: "Monte Carlo transport in TCAD is used for:", options: ["Statistical yield analysis", "Accurate simulation of high-energy carrier transport", "Power grid simulation", "Clock network analysis"], answer: 1 },
        ],
      },
      {
        id: "5-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Advanced TCAD research directions and limitations being addressed.",
        keyPoints: [
          "Atomistic TCAD — individual dopant atoms matter at nanoscale",
          "Quantum transport: Non-Equilibrium Green's Function (NEGF)",
          "Machine learning surrogate models for faster TCAD",
          "3D TCAD for FinFET/GAA — computationally expensive",
          "Multi-physics: coupled thermal, mechanical, electrical simulation",
        ],
        deepDive: "Standard drift-diffusion TCAD breaks down at the nanoscale where quantum effects dominate. Non-Equilibrium Green's Function (NEGF) formalism captures quantum transport rigorously but is computationally expensive. Atomistic simulations using tight-binding or ab-initio methods can model individual atoms and bonds — critical for 2D materials and ultra-thin channels. The computational cost of 3D TCAD for FinFET and GAA devices is enormous — a single I-V sweep can take days on a computing cluster. Machine learning surrogate models trained on TCAD datasets are being developed to replace expensive simulations with fast predictions.",
        xp: 50,
        quiz: [
          { q: "NEGF (Non-Equilibrium Green's Function) is used for:", options: ["Process simulation", "Quantum transport simulation", "Power analysis", "Layout verification"], answer: 1 },
          { q: "Machine learning surrogate models for TCAD aim to:", options: ["Replace fabrication", "Provide fast predictions trained on TCAD data", "Improve measurement accuracy", "Generate test patterns"], answer: 1 },
          { q: "Why is atomistic TCAD important at nanoscale?", options: ["Individual atoms and dopants matter at sub-10nm dimensions", "Quantum computers need it", "It's cheaper than conventional TCAD", "It works without calibration"], answer: 0 },
        ],
      },
      {
        id: "5-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "How to read and evaluate TCAD simulation papers.",
        keyPoints: [
          "Check if results are simulation only or calibrated to silicon",
          "Identify transport model used — drift-diffusion vs NEGF",
          "Verify calibration methodology — which parameters were tuned",
          "Simulation papers can over-predict device performance",
          "Best papers combine TCAD prediction with experimental validation",
        ],
        deepDive: "TCAD simulation papers vary enormously in credibility. Pure simulation papers without calibration are speculative — model parameters can be tuned to show any desired result. The most credible papers: (1) show calibration to a known baseline device; (2) use the calibrated model to predict a new structure; (3) then fabricate and measure the new device to verify predictions. When reading TCAD papers, check: what transport model is used (drift-diffusion is faster but less accurate than NEGF); what interface parameters were assumed; whether quantum confinement effects are included for thin channels. A good TCAD paper is transparent about its assumptions and limitations.",
        xp: 50,
        quiz: [
          { q: "An uncalibrated TCAD paper is:", options: ["More accurate", "Speculative — parameters can be tuned freely", "Faster to publish", "More cited"], answer: 1 },
          { q: "The most credible TCAD papers:", options: ["Use only NEGF transport", "Calibrate to baseline, predict new structure, then verify experimentally", "Simulate the largest possible device", "Avoid all approximations"], answer: 1 },
          { q: "Drift-diffusion vs NEGF: drift-diffusion is:", options: ["More accurate but slower", "Faster but less accurate at nanoscale", "Only for 1D structures", "Required for all modern nodes"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 6: Memory + Compute Trends ───────────────────────────────────────
  {
    levelId: 6,
    bonusXp: 180,
    badge: "Memory Architect",
    subLevels: [
      {
        id: "6-bg", type: "background", title: "Background", icon: "📚",
        summary: "Evolution of memory technologies and the compute-memory gap.",
        keyPoints: [
          "Memory hierarchy: registers → L1/L2/L3 cache (SRAM) → DRAM → storage",
          "Memory bandwidth wall: processor far outpaces memory speed",
          "SRAM scales poorly below 5nm due to SRAM cell instability",
          "DRAM faces capacitor scaling limits → 3D DRAM emerging",
          "Emerging: MRAM, ReRAM, PCM — non-volatile, fast, scalable",
        ],
        deepDive: "The memory hierarchy exists because fast memory is expensive and power-hungry. SRAM (6T cell) provides nanosecond access at 10-100x the area of DRAM. As processors got faster, memory latency became the bottleneck — the 'memory wall.' SRAM scaling below 5nm is challenged by SRAM cell instability (VMIN increasing), leakage, and write margin. DRAM capacitors face aspect ratio limits — 3D DRAM (like Samsung's HBM) stacks memory dies vertically. Emerging non-volatile memories promise DRAM-like speed with flash-like non-volatility, potentially collapsing the memory hierarchy.",
        xp: 52,
        quiz: [
          { q: "What is the 'memory wall'?", options: ["Physical memory chip height limit", "Growing gap between processor speed and memory bandwidth", "DRAM refresh overhead", "Cache miss penalty"], answer: 1 },
          { q: "SRAM uses how many transistors per bit cell?", options: ["1T", "2T", "4T", "6T"], answer: 3 },
          { q: "HBM (High Bandwidth Memory) achieves high bandwidth by:", options: ["Faster clock frequency", "3D stacking of DRAM dies", "Using SRAM instead of DRAM", "Wider bus to single die"], answer: 1 },
        ],
      },
      {
        id: "6-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "How emerging memory technologies work and are fabricated.",
        keyPoints: [
          "MRAM: magnetic tunnel junction — spin polarization stores bits",
          "ReRAM/RRAM: resistive switching in metal oxide filaments",
          "PCM: crystalline/amorphous phase transition in GST material",
          "FeRAM: ferroelectric capacitor polarization stores bit",
          "3D NAND: 100+ layer vertical cell stacking for high density",
        ],
        deepDive: "Spin-Transfer Torque MRAM (STT-MRAM) uses a magnetic tunnel junction (MTJ) — two magnetic layers separated by a thin insulator. The resistance is low when magnetizations are parallel, high when antiparallel. Writing switches the free layer magnetization via spin-polarized current. STT-MRAM has nanosecond switching, unlimited endurance, and is back-end compatible. ReRAM stores data as resistance states in a metal oxide — filament formation/dissolution via voltage pulses. Phase-change memory (PCM) switches between crystalline (low resistance) and amorphous (high resistance) states in GeSbTe (GST) alloy.",
        xp: 52,
        quiz: [
          { q: "STT-MRAM stores data as:", options: ["Charge in a capacitor", "Resistance of a magnetic tunnel junction", "Phase state of a material", "Ferroelectric polarization"], answer: 1 },
          { q: "ReRAM resistance switching occurs via:", options: ["Magnetic domain switching", "Filament formation/dissolution in metal oxide", "Phase transition", "Charge trapping"], answer: 1 },
          { q: "PCM uses which material for phase transitions?", options: ["Silicon dioxide", "GeSbTe (GST)", "Hafnium oxide", "Cobalt iron boron"], answer: 1 },
        ],
      },
      {
        id: "6-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Compute-in-memory and AI-driven memory research directions.",
        keyPoints: [
          "Compute-in-memory (CIM): perform MAC operations inside memory array",
          "Analog CIM: use memory cell conductance for matrix multiply",
          "Digital CIM: bit-serial computation in SRAM/DRAM",
          "In-memory AI inference: reduces data movement energy 10-100x",
          "Challenges: precision, noise, device variation in analog CIM",
        ],
        deepDive: "Compute-in-memory (CIM) addresses the energy bottleneck of moving data between memory and processor. In neural network inference, 70%+ of energy is spent moving weights and activations — not computing. Analog CIM encodes weight matrices in memory cell conductances and applies input voltages — current summing through Kirchhoff's current law computes the dot product in analog domain. A 128×128 array computes 128 multiply-accumulate operations in one step. Digital CIM performs bit-serial operations within the SRAM array using modified sense amplifiers. The key challenge for analog CIM is managing device variation, noise, and limited precision (4-8 bits typically).",
        xp: 52,
        quiz: [
          { q: "Compute-in-memory primarily reduces:", options: ["Transistor count", "Data movement energy between memory and processor", "Clock frequency requirements", "Manufacturing cost"], answer: 1 },
          { q: "Analog CIM performs matrix multiplication using:", options: ["Digital adders", "Memory cell conductances and Kirchhoff's current law", "Floating point units", "Lookup tables"], answer: 1 },
          { q: "Main challenge of analog CIM is:", options: ["High power consumption", "Device variation and limited precision", "Incompatibility with CMOS", "Slow write speed"], answer: 1 },
        ],
      },
      {
        id: "6-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "How to evaluate emerging memory and CIM research papers.",
        keyPoints: [
          "Endurance: how many write cycles before failure (MRAM: 10^15, Flash: 10^5)",
          "Retention: how long data is stored without refresh",
          "Switching energy and latency — compare to SRAM baseline",
          "CIM papers: look for TOPS/W (tera-operations per second per watt)",
          "Multi-level cell (MLC) vs single-level cell (SLC) trade-offs",
        ],
        deepDive: "Memory technology papers must report the full set of metrics: (1) Endurance — write cycle lifetime; SRAM has unlimited, MRAM ~10^15, PCM ~10^9, Flash ~10^5; (2) Retention — STT-MRAM targets 10 years at 85°C; (3) Switching energy — compare to SRAM write energy; (4) Read latency — compare to DRAM (50-100ns); (5) Area efficiency — compare to 6T-SRAM or 1T1C-DRAM. For CIM papers, TOPS/W (tera-operations per watt) is the key figure of merit. Be skeptical of papers showing only peak TOPS/W without reporting effective accuracy or considering data loading overhead.",
        xp: 52,
        quiz: [
          { q: "Which memory has the highest endurance?", options: ["Flash (10^5)", "PCM (10^9)", "STT-MRAM (10^15)", "FeRAM (10^12)"], answer: 2 },
          { q: "TOPS/W in CIM papers measures:", options: ["Storage capacity", "Compute efficiency in tera-operations per watt", "Memory bandwidth", "Transistor count"], answer: 1 },
          { q: "Retention in memory means:", options: ["Read speed", "How long data is stored reliably without refresh", "Write endurance", "Area per bit"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 7: AI Hardware Research ───────────────────────────────────────────
  {
    levelId: 7,
    bonusXp: 190,
    badge: "AI Hardware Researcher",
    subLevels: [
      {
        id: "7-bg", type: "background", title: "Background", icon: "📚",
        summary: "The hardware bottleneck in AI and why custom chips matter.",
        keyPoints: [
          "GPT-3 training: ~1.3 GWh energy, ~$4.6M compute cost",
          "AI workloads are dominated by matrix multiply (GEMM)",
          "CPUs are inefficient for parallel GEMM — GPUs emerged as solution",
          "TPU (Google, 2016) — first commercial AI ASIC, 15-30x better than GPU",
          "Transformer models dominate AI — attention mechanism is key bottleneck",
        ],
        deepDive: "Modern AI models are computationally dominated by General Matrix Multiply (GEMM) operations — in transformer models, attention computation and feed-forward layers are both matrix multiplications. CPUs execute these sequentially, while GPUs exploit data parallelism with thousands of cores. But GPUs are still general-purpose — custom AI ASICs (Google TPU, Apple Neural Engine, Qualcomm NPU) can achieve far better performance-per-watt by hardwiring the dataflow, eliminating instruction fetch overhead, and optimizing memory access patterns for AI workloads specifically. The Transformer's self-attention mechanism, with O(N²) complexity, is the current hardware bottleneck.",
        xp: 55,
        quiz: [
          { q: "What operation dominates AI hardware workloads?", options: ["Floating point division", "General Matrix Multiply (GEMM)", "Memory sorting", "Integer comparison"], answer: 1 },
          { q: "Google's TPU improved over GPU by:", options: ["Using faster DRAM", "Hardwiring AI dataflow for ~15-30x better efficiency", "Higher clock frequency", "More memory capacity"], answer: 1 },
          { q: "Self-attention in transformers has computational complexity of:", options: ["O(N)", "O(N log N)", "O(N²) with sequence length N", "O(1)"], answer: 2 },
        ],
      },
      {
        id: "7-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "Systolic arrays, dataflow architectures, and accelerator design techniques.",
        keyPoints: [
          "Systolic array: 2D grid of PEs (processing elements) with local data flow",
          "Weight-stationary vs output-stationary vs row-stationary dataflows",
          "Sparsity exploitation: skip zero weights/activations",
          "Mixed precision: FP32 → FP16 → INT8 → INT4 for efficiency",
          "Tiling and loop reordering to maximize data reuse",
        ],
        deepDive: "The systolic array, popularized by Kung and Leiserson (1982), is the core compute structure in most AI accelerators. A 2D grid of multiply-accumulate (MAC) units passes data — inputs flow horizontally, weights flow vertically, partial sums accumulate diagonally. The key design choice is the dataflow — which operand (weight, input activation, output) stays stationary in register files while others stream through. Weight-stationary maximizes weight reuse; row-stationary (Eyeriss) optimizes for convolutional patterns. Sparsity exploitation skips zero-valued weights and activations, potentially giving 2-10x speedup since neural networks are 50-90% sparse after pruning.",
        xp: 55,
        quiz: [
          { q: "In a systolic array, data flows:", options: ["Randomly to any PE", "Locally between neighboring PEs in a regular pattern", "All to central memory", "Only vertically"], answer: 1 },
          { q: "Sparsity exploitation in AI accelerators skips:", options: ["Non-zero values", "Zero-valued weights and activations", "Integer operations", "Memory reads"], answer: 1 },
          { q: "Mixed precision training uses FP32 master weights but computes in:", options: ["INT8", "FP16", "FP64", "BF16 or FP16"], answer: 3 },
        ],
      },
      {
        id: "7-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Open research problems in AI hardware architecture.",
        keyPoints: [
          "Attention acceleration: linear attention approximations for O(N) complexity",
          "Near-data processing: compute close to HBM or DRAM",
          "Wafer-scale integration: Cerebras CS-2 has 850K cores on one die",
          "Optical computing: photonic matrix multiply at speed of light",
          "Analog AI: resistive crossbar arrays for energy-efficient inference",
        ],
        deepDive: "The core research challenge is closing the gap between AI's growing compute demands and hardware capabilities. Linear attention approximations (Linformer, Performer, FlashAttention) reduce transformer attention from O(N²) to O(N) or improve memory access patterns. Near-data processing places compute units adjacent to memory — Micron's Automata Processor and Samsung's HBM-PIM add compute to DRAM. Wafer-scale integration (Cerebras CS-2) eliminates the reticle limit, creating a 46,225 mm² die with 850,000 AI-optimized cores and 40 GB on-chip SRAM, achieving unprecedented on-chip bandwidth. Each represents a distinct architectural research direction.",
        xp: 55,
        quiz: [
          { q: "FlashAttention improves transformer hardware efficiency by:", options: ["Reducing model parameters", "Optimizing memory access patterns to reduce HBM bandwidth", "Using analog computation", "Eliminating attention layers"], answer: 1 },
          { q: "Near-data processing (NDP) aims to:", options: ["Speed up CPU cores", "Reduce data movement by computing adjacent to memory", "Improve DRAM refresh", "Increase cache size"], answer: 1 },
          { q: "Cerebras CS-2 is notable for:", options: ["Highest clock frequency", "Wafer-scale integration — entire wafer as single chip", "Using optical interconnects", "Lowest power consumption"], answer: 1 },
        ],
      },
      {
        id: "7-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "How to read and benchmark AI hardware research papers.",
        keyPoints: [
          "TOPS (tera-operations/sec) is peak — effective TOPS is much lower",
          "TOPS/W is energy efficiency — key for edge AI",
          "Roofline model: identify if compute or memory-bandwidth limited",
          "Benchmark on real workloads: ResNet, BERT, GPT — not synthetic",
          "Area efficiency: TOPS/mm² — relevant for cost and yield",
        ],
        deepDive: "AI accelerator papers must be evaluated carefully. Peak TOPS is always reported optimistically — it assumes 100% utilization, which never happens due to data loading, activation functions, and control flow. Effective TOPS on real workloads (ResNet-50, BERT, GPT-2) is typically 30-60% of peak. The Roofline model is essential — it identifies whether a workload is compute-bound (limited by MAC throughput) or memory-bandwidth-bound (limited by data loading speed). Most AI workloads are memory-bandwidth-bound, meaning adding more MACs without proportionally increasing memory bandwidth gives no benefit. Check: what memory system (SRAM, HBM, LPDDR) and its bandwidth.",
        xp: 55,
        quiz: [
          { q: "Why is peak TOPS misleading?", options: ["It's measured incorrectly", "Real utilization is 30-60% of peak due to memory/control overhead", "It only counts integer operations", "It varies by temperature"], answer: 1 },
          { q: "The Roofline model identifies if a workload is:", options: ["Correct or incorrect", "Compute-bound or memory-bandwidth-bound", "Power-limited or thermal-limited", "Deterministic or stochastic"], answer: 1 },
          { q: "TOPS/W measures:", options: ["Peak throughput", "Energy efficiency in tera-operations per watt", "Area efficiency", "Memory bandwidth"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 8: Advanced Packaging ─────────────────────────────────────────────
  {
    levelId: 8,
    bonusXp: 200,
    badge: "Packaging Innovator",
    subLevels: [
      {
        id: "8-bg", type: "background", title: "Background", icon: "📚",
        summary: "Why advanced packaging became the new frontier of semiconductor scaling.",
        keyPoints: [
          "Reticle limit: max single die size ~850mm² limits what fits on one chip",
          "Chiplets: break large SoC into smaller dies, combine in package",
          "2.5D: dies side-by-side on silicon interposer (TSMC CoWoS)",
          "3D IC: dies stacked vertically with TSV or hybrid bonding",
          "HBM uses 3D stacking for high bandwidth memory next to logic",
        ],
        deepDive: "As silicon scaling slows, advanced packaging has emerged as the primary driver of system-level performance improvement. The fundamental insight: it's cheaper and more yield-efficient to combine multiple smaller dies (chiplets) than to make one large die. AMD's Ryzen uses separate CPU and I/O chiplets. Apple M-series uses interposer-connected compute tiles. NVIDIA's GB200 combines logic and HBM memory on a silicon interposer. Intel's Foveros stacks a compute tile on a base die. UCIe (Universal Chiplet Interconnect Express) is the emerging standard for chiplet interfaces, enabling interoperability between vendors.",
        xp: 58,
        quiz: [
          { q: "What is the main motivation for chiplet architectures?", options: ["Higher clock speeds", "Better yield and cost for large systems by splitting into smaller dies", "Lower power consumption per transistor", "Simpler design process"], answer: 1 },
          { q: "2.5D integration places dies:", options: ["Directly on top of each other", "Side-by-side on a silicon interposer", "In separate packages", "On a flexible substrate"], answer: 1 },
          { q: "UCIe is:", options: ["A new DRAM standard", "Universal Chiplet Interconnect Express — standard for chiplet interfaces", "A 3D stacking technology", "A thermal management solution"], answer: 1 },
        ],
      },
      {
        id: "8-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "Key 3D integration and advanced packaging technologies.",
        keyPoints: [
          "TSV (Through-Silicon Via): vertical metal interconnect through die",
          "Hybrid bonding: Cu-Cu direct bonding at micron pitch (<1μm)",
          "Microbumps: solder bumps at 20-50μm pitch for 2.5D/3D",
          "RDL (Redistribution Layer): reroutes I/O for fine-pitch connections",
          "Thermal challenges: heat removal from stacked dies",
        ],
        deepDive: "Through-Silicon Vias (TSVs) drill vertical holes through the die and fill with tungsten or copper — enabling vertical electrical connections between stacked dies. HBM uses TSVs at ~50μm pitch. Hybrid bonding (used in Sony CMOS image sensors and Apple A17 Pro) directly bonds copper pads — no solder bumps — enabling sub-micron pitch interconnects at 10^6/mm² density vs 10^4/mm² for flip-chip. This dramatically increases bandwidth between stacked dies. Redistribution layers (RDLs) built with semi-additive process (SAP) create fine-pitch fan-out routing. The primary engineering challenge in 3D stacking is thermal: heat from the bottom die must travel through the top die's substrate, requiring careful thermal management.",
        xp: 58,
        quiz: [
          { q: "TSV (Through-Silicon Via) enables:", options: ["Horizontal die-to-die connection", "Vertical electrical connection through the die", "Wireless chip communication", "Optical data transfer"], answer: 1 },
          { q: "Hybrid bonding achieves higher interconnect density than flip-chip by:", options: ["Using larger bumps", "Direct Cu-Cu bonding without solder at sub-micron pitch", "Increasing die thickness", "Using aluminum instead of copper"], answer: 1 },
          { q: "The primary thermal challenge in 3D stacked dies is:", options: ["Higher operating voltage", "Heat removal from bottom dies through top die substrate", "Electromagnetic interference", "TSV resistance"], answer: 1 },
        ],
      },
      {
        id: "8-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Active research frontiers in advanced packaging.",
        keyPoints: [
          "Wafer-to-wafer bonding at <100nm alignment accuracy",
          "Photonic interconnects: optical die-to-die for bandwidth beyond Cu",
          "Active interposers: embed compute/memory in the interposer",
          "Heterogeneous integration: mix Si, GaN, III-V in one package",
          "Embedded cooling: microfluidic channels inside silicon",
        ],
        deepDive: "Research in advanced packaging is pushing multiple frontiers simultaneously. Wafer-to-wafer direct bonding (imec, MIT) achieves sub-100nm alignment accuracy, enabling connection pitch below 1μm. Silicon photonics integrates optical waveguides and modulators on silicon — co-packaged optics (CPO) places laser sources and photonics directly on the package, targeting Tb/s bandwidth for AI interconnects. Active interposers (Georgia Tech, imec) embed voltage regulators, memory controllers, or even compute in the interposer itself. Microfluidic cooling (Stanford, IBM) etches microchannels directly in silicon for 100W/cm² heat removal — critical for stacked AI accelerators.",
        xp: 58,
        quiz: [
          { q: "Co-packaged optics (CPO) aims to provide:", options: ["Better thermal management", "Tb/s optical die-to-die bandwidth replacing copper", "Cheaper manufacturing", "Lower latency DRAM access"], answer: 1 },
          { q: "Microfluidic cooling in silicon provides:", options: ["Electrical insulation", "Direct liquid cooling through etched channels in the die", "EMI shielding", "Mechanical support"], answer: 1 },
          { q: "Heterogeneous integration combines:", options: ["Only digital logic dies", "Different semiconductor materials (Si, GaN, III-V) in one package", "Only memory and logic", "Dies from same process node"], answer: 1 },
        ],
      },
      {
        id: "8-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "How to evaluate advanced packaging and 3D integration papers.",
        keyPoints: [
          "Key metrics: interconnect density (connections/mm²), bandwidth density (Gb/s/mm²)",
          "Yield: smaller chiplets have higher yield — quantify yield improvement",
          "Power delivery: IR drop through TSVs and package",
          "Thermal resistance: junction-to-ambient (θJA) for stacked systems",
          "Manufacturing cost: package cost often exceeds die cost at advanced nodes",
        ],
        deepDive: "Packaging papers should be evaluated on: (1) Interconnect density — how many connections per mm² at the die-to-die interface; (2) Bandwidth density — Gb/s per mm of interface width; (3) Energy efficiency — pJ/bit for die-to-die communication (copper at 1-5 pJ/bit vs optical at 0.1-1 pJ/bit); (4) Yield and manufacturing cost — how does splitting into chiplets affect cost? A key insight: yield of a die scales exponentially with die area, so splitting a 600mm² die into 2×300mm² dies can improve yield from ~30% to ~60%. Papers from ECTC, VLSI, and ISSCC are premier packaging venues.",
        xp: 58,
        quiz: [
          { q: "Why do chiplets improve yield over monolithic dies?", options: ["They use better silicon", "Yield scales exponentially with area — smaller dies have much higher yield", "They operate at lower voltage", "They use fewer transistors"], answer: 1 },
          { q: "Bandwidth density in packaging is measured as:", options: ["Total connections", "Gb/s per mm of interface width", "Watts per mm²", "GHz clock frequency"], answer: 1 },
          { q: "Energy per bit for optical die-to-die interconnects vs copper:", options: ["Much higher (10x)", "About the same", "Much lower (~10-50x)", "Zero (light is free)"], answer: 2 },
        ],
      },
    ],
  },

  // ── Level 9: Publications + Patents ─────────────────────────────────────────
  {
    levelId: 9,
    bonusXp: 210,
    badge: "Research Author",
    subLevels: [
      {
        id: "9-bg", type: "background", title: "Background", icon: "📚",
        summary: "The academic publishing system and how semiconductor research is disseminated.",
        keyPoints: [
          "Conference papers: IEDM, VLSI, ISSCC, DAC — fast publication, peer reviewed",
          "Journal papers: IEEE TED, Nature Electronics — detailed, high impact",
          "Preprints: arXiv — immediate but not peer reviewed",
          "H-index and citation count measure researcher impact",
          "IP vs publication conflict: patents filed before public disclosure",
        ],
        deepDive: "Semiconductor research is primarily published in IEEE conferences and journals. IEDM (International Electron Devices Meeting) is the top venue for device and process technology — acceptance rate ~30%. ISSCC (International Solid-State Circuits Conference) is the premier circuit design venue. Nature Electronics publishes high-impact device research with broad audience. The publication-patent tension is critical in industry research: companies must file patents before publishing to maintain IP protection. Academics typically publish first. Understanding citation impact, h-index, and journal impact factors helps navigate the research ecosystem.",
        xp: 60,
        quiz: [
          { q: "IEDM is the premier conference for:", options: ["Circuit design", "Device and process technology", "Computer architecture", "CAD tools"], answer: 1 },
          { q: "Why must patents be filed before publication in industry research?", options: ["It's faster", "Public disclosure before patent filing can invalidate the patent", "Patents cost less before publication", "Companies require it for employment"], answer: 1 },
          { q: "H-index of a researcher measures:", options: ["Number of papers only", "Number of citations only", "Balanced measure of productivity and impact", "Age of researcher"], answer: 2 },
        ],
      },
      {
        id: "9-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "How to write, structure, and submit a semiconductor research paper.",
        keyPoints: [
          "Paper structure: Abstract → Introduction → Device/Methods → Results → Discussion → Conclusion",
          "Abstract must state: problem, approach, key result, significance",
          "Introduction: explain why problem matters and survey prior work",
          "Results section: let data speak — figures are paramount",
          "Revision process: average 2-3 rounds for journal papers",
        ],
        deepDive: "Writing a semiconductor paper requires both technical precision and clear communication. The abstract is the most-read part — it must convey the problem, your approach, the key result (specific numbers), and why it matters, in 150-250 words. The introduction surveys prior work and articulates the gap your work fills — use the funnel structure: broad context → specific problem → your solution. Results figures should be self-contained with comprehensive captions. For device papers, always include: fabrication process schematic, SEM/TEM images, key electrical characterization (I-V, C-V), benchmarking against state-of-the-art. Reviewers check: novelty, correctness, completeness, and significance.",
        xp: 60,
        quiz: [
          { q: "What must an abstract include?", options: ["Author affiliations only", "Problem, approach, key result with numbers, and significance", "All experimental details", "Funding sources"], answer: 1 },
          { q: "In the results section, figures should be:", options: ["Minimal to save space", "Self-contained with comprehensive captions", "Referenced only in text", "Black and white only"], answer: 1 },
          { q: "The 'funnel structure' in an introduction goes from:", options: ["Specific to broad", "Broad context → specific problem → your solution", "Methods to results", "Conclusion to introduction"], answer: 1 },
        ],
      },
      {
        id: "9-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Finding novelty and defining research contributions.",
        keyPoints: [
          "Novelty types: new device, new process, new model, new characterization",
          "Prior art search: Google Scholar, IEEE Xplore, USPTO, Espacenet",
          "Research gap: what question is unanswered? What claim is unverified?",
          "Strongest claims: combination of simulation + fabrication + measurement",
          "Reproducibility: enough detail for others to replicate your work",
        ],
        deepDive: "Finding genuine novelty is the hardest part of research. Start with a thorough prior art search — IEEE Xplore, ACM Digital Library, arXiv, Google Scholar. Identify what has NOT been done: a new material for a known device structure, a new characterization technique, a new model that explains observed phenomena, a new device concept, or a new integration approach. The strongest research combines analytical or simulation insight with experimental demonstration — theory alone or measurement alone is weaker. When defining your contribution, be specific: 'first demonstration of sub-1nm channel MoS2 TFET with SS = 45 mV/dec and ION > 100 μA/μm' is a clear, verifiable claim.",
        xp: 60,
        quiz: [
          { q: "Prior art search should cover:", options: ["Only your own lab's papers", "IEEE Xplore, arXiv, patents — comprehensive literature", "Only the last 2 years", "Only conference papers"], answer: 1 },
          { q: "The strongest research contributions combine:", options: ["Theory only", "Measurement only", "Simulation + fabrication + measurement", "Patent + paper"], answer: 2 },
          { q: "A clear research claim should be:", options: ["Broad and general", "Specific and verifiable with numbers", "Qualitative only", "Compared only to your previous work"], answer: 1 },
        ],
      },
      {
        id: "9-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "Understanding patent structure and how to write patent claims.",
        keyPoints: [
          "Patent structure: title, abstract, drawings, specification, claims",
          "Independent claims: broadest protection — must be novel over prior art",
          "Dependent claims: narrow independent claims, add specific embodiments",
          "Prosecution: back-and-forth with patent examiner to grant/reject claims",
          "Freedom to operate (FTO): can you practice your technology without infringing?",
        ],
        deepDive: "A patent protects an invention — a novel, non-obvious, useful process, device, or composition. The claims are the legal scope of protection. Independent claim 1 is broadest: 'A transistor comprising: a fin-shaped semiconductor channel; a gate electrode surrounding three sides of the channel...' Dependent claims add specifics: 'The transistor of claim 1, wherein the channel comprises silicon germanium...' Writing broad but defensible claims requires understanding prior art precisely. In semiconductor research, process patents (novel fabrication steps), device patents (novel structures), and circuit patents (novel architectures) are all common. Companies like Qualcomm, Samsung, and IBM each hold tens of thousands of patents.",
        xp: 60,
        quiz: [
          { q: "In a patent, the 'claims' define:", options: ["The experimental results", "The legal scope of protection", "The background of the invention", "The author's credentials"], answer: 1 },
          { q: "Independent claims are:", options: ["The narrowest protection", "The broadest protection — foundation of the patent", "Optional in a patent", "Only for process patents"], answer: 1 },
          { q: "Freedom to Operate (FTO) analysis determines:", options: ["If your design rules are correct", "If you can practice your technology without infringing others' patents", "If your paper will be accepted", "If your process is manufacturable"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 10: Real Research Projects ────────────────────────────────────────
  {
    levelId: 10,
    bonusXp: 230,
    badge: "Research Engineer",
    subLevels: [
      {
        id: "10-bg", type: "background", title: "Background", icon: "📚",
        summary: "How to choose and scope a semiconductor research project.",
        keyPoints: [
          "Research tracks: device, circuit, architecture, process, or materials",
          "Time horizon: 6-month study vs 2-year device demonstration",
          "Resources required: simulation only vs fab access vs measurement tools",
          "Advisor/company alignment: choose problems they care about",
          "Publish vs patent decision based on career goals",
        ],
        deepDive: "Choosing a research project is the most consequential early research decision. Consider: (1) Resources — TCAD simulation requires only a computer; fabrication requires cleanroom access and months of process development; (2) Novelty feasibility — can you realistically advance the state of the art with your resources? (3) Publication venue fit — is IEDM the target, or IEEE Transactions? (4) Career alignment — device physics research leads to fab roles; architecture research leads to design roles; (5) Time to results — a simulation study can yield results in 3 months; a fabrication study may take 18 months for first electrical data.",
        xp: 65,
        quiz: [
          { q: "Which research track requires cleanroom access?", options: ["TCAD simulation study", "Architecture simulation", "Device fabrication and measurement", "ML-based design optimization"], answer: 2 },
          { q: "For a 6-month research project, the most feasible approach is:", options: ["Novel device fabrication from scratch", "TCAD simulation or architecture modeling study", "Full process technology development", "Building a complete chip tape-out"], answer: 1 },
          { q: "Publication vs patent decision mainly depends on:", options: ["Paper length", "Career goals and whether IP protection is needed", "Conference acceptance rate", "Number of co-authors"], answer: 1 },
        ],
      },
      {
        id: "10-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "Project management and experimental design in semiconductor research.",
        keyPoints: [
          "Experimental design: vary one parameter at a time (DOE principles)",
          "Control experiments: baseline to compare against",
          "Statistical validity: n≥5 devices for characterization",
          "Lab notebook: dated, witnessed entries for patent purposes",
          "Version control for simulation files (Git for TCAD scripts)",
        ],
        deepDive: "Good experimental design separates impactful research from noise. Design of Experiments (DOE) principles: vary one parameter at a time to isolate effects; use factorial design to explore interactions efficiently. Always include a control — an unmodified baseline device fabricated and measured alongside your new device on the same wafer, in the same measurement session. For statistical validity, characterize at least 5-10 devices and report mean ± standard deviation. Keep a detailed lab notebook with date, wafer lot number, process parameters, and observations — this is essential for patent prosecution and reproducibility. Use version control (Git) for TCAD input files and analysis scripts.",
        xp: 65,
        quiz: [
          { q: "The key principle of Design of Experiments (DOE) is:", options: ["Change all parameters simultaneously", "Vary one parameter at a time to isolate effects", "Use the largest sample size possible", "Avoid control experiments"], answer: 1 },
          { q: "Why is a lab notebook with dated entries important?", options: ["For publication formatting", "For patent prosecution — establishes invention date and priority", "For grade reporting", "For conference registration"], answer: 1 },
          { q: "Statistical validity in device characterization requires:", options: ["1 device measurement", "At least 5-10 devices with mean ± standard deviation", "100+ devices always", "Only simulation comparison"], answer: 1 },
        ],
      },
      {
        id: "10-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Specific research tracks available in semiconductor research.",
        keyPoints: [
          "Track 1: TFET low-power device — fabricate or TCAD model",
          "Track 2: AI accelerator architecture — RTL + cycle-accurate simulation",
          "Track 3: Chiplet interconnect — model bandwidth-power trade-off",
          "Track 4: Memory innovation — CIM array design and characterization",
          "Track 5: GAA variability study — TCAD Monte Carlo",
        ],
        deepDive: "Five specific research tracks with clear entry points: (1) TFET: start with Sentaurus TCAD, calibrate to published experimental data, then explore new geometries or materials — achievable in 3-6 months; (2) AI accelerator: use Timeloop or MAESTRO for dataflow modeling, implement systolic array in RTL — 6-12 months; (3) Chiplet interconnect: model UCIe or CXL bandwidth and power using analytical models, compare to monolithic — 3-4 months; (4) CIM array: design a 64×64 SRAM CIM array in cadence, characterize noise margin and bit precision — 6-9 months; (5) GAA variability: Sentaurus Monte Carlo with random dopant fluctuations across 1000 device instances — 3-6 months.",
        xp: 65,
        quiz: [
          { q: "Timeloop or MAESTRO tools are used for:", options: ["TCAD device simulation", "AI accelerator dataflow modeling and analysis", "Physical design", "Memory characterization"], answer: 1 },
          { q: "TCAD Monte Carlo simulation varies:", options: ["Voltage conditions", "Random device parameters to study statistical variability", "Temperature only", "Gate dielectric thickness only"], answer: 1 },
          { q: "A chiplet interconnect study using analytical models takes approximately:", options: ["1 week", "3-4 months", "2 years", "5+ years"], answer: 1 },
        ],
      },
      {
        id: "10-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "Building your research portfolio and preparing publications.",
        keyPoints: [
          "Start writing early — don't wait until all experiments are done",
          "Conference paper first (4-6 pages) → expand to journal (10-15 pages)",
          "arXiv preprint establishes priority date before conference review",
          "Research portfolio: GitHub, personal website, Google Scholar profile",
          "Advisor relationship: weekly meetings, written updates, proactive communication",
        ],
        deepDive: "Research output management is as important as the research itself. Start drafting your paper when you have 60% of the results — this reveals what experiments are missing and sharpens your narrative. Targeting an IEEE conference paper (4-6 pages, IEDM/VLSI format) first forces clarity — then expand to a journal (IEEE TED, IEEE JSSC) with more detail and experiments. Post to arXiv immediately before conference submission to establish priority. Build a digital research presence: Google Scholar profile (auto-populated from papers), GitHub repository for simulation code, personal website with research summary. Weekly written updates to your advisor keep research on track and create a record of progress.",
        xp: 65,
        quiz: [
          { q: "When should you start writing your research paper?", options: ["Only after all experiments are complete", "When you have ~60% of results — reveals gaps and sharpens narrative", "After submission deadline passes", "Only when advisor asks"], answer: 1 },
          { q: "Posting to arXiv before conference submission establishes:", options: ["Peer review", "Priority date for your contribution", "Conference acceptance", "Patent protection"], answer: 1 },
          { q: "A conference paper typically expanding to a journal adds:", options: ["Fewer figures", "More detailed experiments, analysis, and broader context", "Shorter abstract", "Fewer references"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 11: Career Readiness ───────────────────────────────────────────────
  {
    levelId: 11,
    bonusXp: 250,
    badge: "Research Career Ready",
    subLevels: [
      {
        id: "11-bg", type: "background", title: "Background", icon: "📚",
        summary: "Career paths in semiconductor research — academia vs industry.",
        keyPoints: [
          "Academia: Professor → tenure track → full professor; publish, teach, advise",
          "Industry research: Intel Labs, TSMC R&D, IMEC, IBM Research",
          "Applied research: bridging gap between basic research and product",
          "MS vs PhD: MS is 2 years (coursework+thesis); PhD is 4-6 years",
          "Internship at Intel/TSMC/IMEC during PhD is highly strategic",
        ],
        deepDive: "Semiconductor research careers branch into academia and industry R&D. Academic researchers (professors) define their own research agenda, publish freely, and advise PhD students — but face competitive tenure processes and grant-writing pressure. Industry researchers at Intel Labs, TSMC R&D, IMEC, Samsung Advanced Institute of Technology, and IBM Research work on longer time horizon problems (3-10 years) with fab and equipment access unavailable in academia. Applied research roles bridge basic research and product development — translating new devices or architectures into manufacturable processes within 1-3 year timelines. A PhD from a top program (Stanford, MIT, Berkeley, Caltech, Delft) with strong publications is the standard entry path.",
        xp: 68,
        quiz: [
          { q: "IMEC is known as:", options: ["A chip design company", "A leading semiconductor research institute (Belgium)", "An EDA tool company", "A memory manufacturer"], answer: 1 },
          { q: "A PhD in semiconductor research typically takes:", options: ["1-2 years", "4-6 years", "10+ years", "Exactly 3 years"], answer: 1 },
          { q: "Applied research differs from basic research by:", options: ["Using more math", "Having shorter time horizon and direct product relevance", "Being done only in academia", "Requiring no publications"], answer: 1 },
        ],
      },
      {
        id: "11-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "How to prepare for MS/PhD applications and research interviews.",
        keyPoints: [
          "Statement of Purpose (SOP): research experience + specific interest + fit",
          "Research proposal: problem statement, approach, expected contribution",
          "Technical interview: device physics, TCAD, fabrication, circuits",
          "Publication record: even one first-author paper dramatically improves admissions",
          "Reference letters: choose advisors who know your research deeply",
        ],
        deepDive: "MS/PhD applications are evaluated on: GPA, GRE (increasingly optional), research experience, publications, SOP, and recommendation letters. The Statement of Purpose should: (1) describe specific research you've done — don't just list courses; (2) identify 2-3 specific faculty members and why their work aligns with yours; (3) state what you will contribute to the field. Industry research interviews test both fundamentals (explain p-n junction under forward bias, draw FinFET I-V curve, derive SS expression) and research thinking (how would you improve TFET ON current? what are the challenges of 2D material integration?). Having even one first-author conference paper as an undergraduate or MS student dramatically differentiates you.",
        xp: 68,
        quiz: [
          { q: "A strong Statement of Purpose (SOP) must include:", options: ["GRE scores", "Specific research experience and faculty alignment with reasons", "All courses taken", "University rankings"], answer: 1 },
          { q: "In a research interview, 'explain SS derivation' tests:", options: ["Memorization", "Fundamental device physics understanding", "Programming skill", "Lab technique"], answer: 1 },
          { q: "Having a first-author publication as an undergrad/MS applicant:", options: ["Doesn't matter much", "Dramatically differentiates you from other applicants", "Only helps for industry, not academia", "Is required for admission"], answer: 1 },
        ],
      },
      {
        id: "11-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "Building a research portfolio and long-term research vision.",
        keyPoints: [
          "Research identity: what is your specific expertise? Be known for something",
          "Collaboration network: build relationships with labs worldwide",
          "Conference presence: present at IEDM, VLSI, ISSCC — get known",
          "Industry advisory: consult for or intern at relevant companies",
          "Long-term vision: where will semiconductor technology be in 10 years?",
        ],
        deepDive: "Successful semiconductor researchers build a distinct identity — you want to be known as 'the expert in GAA nanosheet transport' or 'the person who broke the SS record with ferroelectric FETs.' This requires sustained focus on a problem, building a body of work over 3-5 years rather than scattered one-off papers. Conference networking is essential — IEDM, VLSI, and ISSCC bring together the world's top researchers. Presenting your work, having discussions at poster sessions, and following up with collaborators builds the network that leads to faculty positions, industry research offers, and collaborative grants. Think about your 10-year vision: will GAA dominate? Will 2D materials enter production? Will analog CIM transform AI? Positioning yourself at the intersection of current trends and future needs is strategic.",
        xp: 68,
        quiz: [
          { q: "Building a research identity means:", options: ["Publishing in every field", "Becoming known for deep expertise in a specific area over years", "Changing topics frequently", "Only working alone"], answer: 1 },
          { q: "IEDM, VLSI, ISSCC conferences are important for researchers because:", options: ["They're easy to get papers accepted", "They bring together world's top researchers for networking and collaboration", "They have the highest citation rates", "They offer the best travel opportunities"], answer: 1 },
          { q: "Strategic positioning in research means:", options: ["Working on the oldest problems", "Aligning your expertise with intersection of current trends and future needs", "Avoiding competition", "Only working on industry-funded problems"], answer: 1 },
        ],
      },
      {
        id: "11-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "Research presentation skills and conference communication.",
        keyPoints: [
          "Oral presentation: 12-15 min talk + 5 min Q&A at major conferences",
          "Poster presentation: 60-90 min at poster session — practice 2-min pitch",
          "Key slide structure: motivation → approach → key result → impact",
          "Q&A preparation: anticipate 'why not just use CMOS?' and 'what are limitations?'",
          "Job talk: 45-60 min comprehensive research narrative for faculty/industry positions",
        ],
        deepDive: "Presenting research effectively is as important as doing good research. For oral presentations at IEDM/VLSI (12-15 minutes): open with a compelling motivation (why does this matter?); present one key result prominently by slide 4-5; save methodology details for later; close with future work and impact. Prepare for Q&A by anticipating: (1) 'Why not just scale CMOS further?' (2) 'What is the fabrication complexity vs benefit?' (3) 'How does your device perform at circuit level, not just device level?' For faculty job talks (45-60 minutes), tell your complete research story — past work, current projects, and a 5-year vision. Industry research talks emphasize practical impact and manufacturing pathways.",
        xp: 68,
        quiz: [
          { q: "An oral presentation at IEDM should lead with:", options: ["Fabrication process details", "Compelling motivation — why the problem matters", "Mathematical derivations", "Author biography"], answer: 1 },
          { q: "A common Q&A challenge at device conferences is:", options: ["Questions about funding", "'Why not just scale CMOS?' — you must have a convincing answer", "Questions about number of authors", "Conference registration process"], answer: 1 },
          { q: "A faculty job talk differs from a conference talk by:", options: ["Being shorter", "Including a 5-year research vision and teaching philosophy", "Having fewer figures", "Being informal"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 12: Final Boss — Silicon Innovator ────────────────────────────────
  {
    levelId: 12,
    bonusXp: 500,
    badge: "Silicon Innovator",
    subLevels: [
      {
        id: "12-bg", type: "background", title: "Background", icon: "📚",
        summary: "The full landscape of semiconductor innovation and your place in it.",
        keyPoints: [
          "Semiconductor industry: $600B+ market, foundation of global technology",
          "Research → development → manufacturing cycle: 10-20 years",
          "Current inflection: end of geometric scaling, beginning of system scaling",
          "Your generation will define: post-silicon materials, 3D integration, AI silicon",
          "Innovation requires: deep fundamentals + broad vision + execution ability",
        ],
        deepDive: "You have now built a comprehensive understanding of semiconductor research — from device physics to TCAD, from FinFET to GAA, from memory to AI accelerators, from packaging to publications. The semiconductor industry is at a unique inflection point: traditional geometric scaling is approaching physical limits while demand for compute (driven by AI, autonomous systems, edge computing) is accelerating. The next generation of researchers — your generation — will define what comes after CMOS, how 3D integration evolves into true 3D computation, how AI workloads shape hardware architecture, and how new materials enter the semiconductor ecosystem. This is not just a technical challenge but an opportunity to shape global technology.",
        xp: 75,
        quiz: [
          { q: "The semiconductor industry's current inflection point involves:", options: ["Returning to vacuum tubes", "Transition from geometric scaling to system-level scaling", "Abandoning silicon entirely", "Moving all compute to the cloud"], answer: 1 },
          { q: "The semiconductor market size is approximately:", options: ["$10 billion", "$100 billion", "$600+ billion", "$10 trillion"], answer: 2 },
          { q: "The research-to-manufacturing cycle for new semiconductor technology is approximately:", options: ["1-2 years", "10-20 years", "50+ years", "6 months"], answer: 1 },
        ],
      },
      {
        id: "12-tech", type: "techniques", title: "Present Techniques", icon: "🔬",
        summary: "How to propose and evaluate a novel semiconductor concept.",
        keyPoints: [
          "Novel concept elements: new material + new structure + new mechanism",
          "Figure of merit: define the metric that matters for your application",
          "Feasibility analysis: what fab steps are required? Existing or new?",
          "Simulation roadmap: TCAD → circuit → system performance projection",
          "Risk assessment: what could make this concept fail?",
        ],
        deepDive: "Proposing a novel semiconductor concept requires structured thinking: (1) Problem clarity — what specific limitation of current technology are you addressing? Be quantitative: 'CMOS operates at minimum 0.5V due to 60 mV/dec SS limit; I propose to reduce VDD to 0.3V using ferroelectric gate'; (2) Technical approach — what physical mechanism enables your solution? Why is it fundamentally different from prior work? (3) Feasibility — can this be fabricated with existing or near-future process capabilities? Concepts requiring 17 new process steps have low industrial relevance; (4) Figure of merit — define the metric that captures your device's advantage; (5) Risk factors — what physical effects could prevent your concept from working? Identifying risks honestly strengthens credibility.",
        xp: 75,
        quiz: [
          { q: "A novel semiconductor concept should begin with:", options: ["A manufacturing process", "A clear quantitative statement of what limitation it addresses", "A publication plan", "A patent filing"], answer: 1 },
          { q: "Concepts requiring many new fabrication steps have:", options: ["Higher scientific value", "Lower industrial relevance and adoption probability", "Faster time to market", "Higher yield"], answer: 1 },
          { q: "Identifying risks in your concept:", options: ["Weakens your proposal", "Strengthens credibility by showing honest analysis", "Is only done after fabrication", "Is the reviewer's job"], answer: 1 },
        ],
      },
      {
        id: "12-angles", type: "angles", title: "Research Angles", icon: "🎯",
        summary: "The 5 highest-impact research directions for the next decade.",
        keyPoints: [
          "1. 2D material CMOS: MoS2/WSe2 beyond-silicon channel for sub-1nm EOT",
          "2. Ferroelectric computing: NC-FET + FeRAM for ultra-low-power AI",
          "3. Monolithic 3D: sequential 3D with low-temperature top-tier transistors",
          "4. Photonic-electronic integration: silicon photonics for AI interconnects",
          "5. Quantum error correction hardware: silicon spin qubits at scale",
        ],
        deepDive: "Five research directions with the highest 10-year impact: (1) 2D material CMOS — MoS2 N-FET + WSe2 P-FET complement each other for true 2D CMOS; IBM demonstrated this in 2023 but fab integration remains unsolved; (2) Ferroelectric computing — HfO2-based NC-FETs can reduce VDD to 0.2V; FeRAM-based CIM enables 1000x more efficient AI inference; (3) Monolithic 3D — stacking transistor layers sequentially on one wafer rather than bonding dies; requires low-temperature (<400°C) back-end transistor processes; (4) Silicon photonics — co-integrating lasers, modulators, and detectors with CMOS for optical AI interconnects; (5) Silicon spin qubits — leveraging CMOS fab for quantum computing hardware at the 1K qubit milestone.",
        xp: 75,
        quiz: [
          { q: "2D material CMOS uses MoS2 for N-FET and which material for P-FET?", options: ["Silicon", "WSe2", "GaN", "Germanium"], answer: 1 },
          { q: "Monolithic 3D integration requires low-temperature back-end processes because:", options: ["To save energy", "To avoid damaging already-fabricated bottom-tier transistors", "Cheaper equipment", "Faster throughput"], answer: 1 },
          { q: "Silicon photonics for AI addresses:", options: ["Transistor scaling", "Optical interconnect bandwidth for AI accelerator systems", "Memory capacity", "Power supply design"], answer: 1 },
        ],
      },
      {
        id: "12-paper", type: "paper", title: "Research Paper", icon: "📄",
        summary: "Writing your Silicon Innovator research proposal — the final challenge.",
        keyPoints: [
          "Proposal format: executive summary + technical approach + impact + timeline",
          "Executive summary: 1 paragraph, non-specialist audience, hook with impact",
          "Technical section: device physics + simulation evidence + fabrication path",
          "Impact statement: how does this change semiconductor technology?",
          "Timeline: 6-month milestones from concept to first experimental data",
        ],
        deepDive: "Your final challenge is to write a complete research proposal for a novel semiconductor concept. This mirrors real grant proposals (NSF, DARPA, SRC) and industry research project proposals. Structure: (1) Executive summary — 1 paragraph for a non-specialist: what problem, what solution, why now, what impact; (2) State of the art — what exists, what is missing; (3) Technical approach — your novel concept with supporting physics, TCAD simulations or analytical modeling; (4) Expected results — define target metrics (SS, ION, VDD, TOPS/W) and how you'll measure success; (5) Fabrication/implementation path — what process steps, what tools; (6) Timeline with 6-month milestones; (7) Risk mitigation — what could fail and your contingency plan. This document IS your Silicon Innovator badge.",
        xp: 75,
        quiz: [
          { q: "An executive summary in a research proposal should be written for:", options: ["Expert specialists only", "Non-specialist audience — broad impact in one compelling paragraph", "Patent examiners", "Manufacturing engineers only"], answer: 1 },
          { q: "Risk mitigation in a proposal shows:", options: ["Weakness", "Scientific maturity and honest assessment — strengthens credibility", "The project will fail", "Lack of confidence"], answer: 1 },
          { q: "Defining target metrics (SS, ION, TOPS/W) in a proposal allows:", options: ["Easy rejection by reviewers", "Clear measurement of success and progress", "Avoiding experimental work", "Publication before results"], answer: 1 },
        ],
      },
    ],
  },
];
// ─── RTL SUB-LEVELS ──────────────────────────────────────────────────────────
// Add this to your data.ts file after the RESEARCH_SUB_LEVELS export

export type RTLSubLevelType = "concept" | "syntax" | "walkthrough" | "lab" | "quiz";

export type RTLLabData = {
  instructions: string;
  starterCode: string;
  hints: string[];
  requiredPatterns: string[];
  forbiddenPatterns: string[];
  solutionExplanation: string;
  editorLanguage: string;
};

export type RTLSubLevel = {
  id: string;
  type: RTLSubLevelType;
  title: string;
  icon: string;
  summary: string;
  keyPoints?: string[];
  content?: string;
  lab?: RTLLabData;
  xp: number;
  quiz?: { q: string; options: string[]; answer: number }[];
};

export type RTLLevelData = {
  levelId: number;
  subLevels: RTLSubLevel[];
  bonusXp: number;
  badge: string;
};

export const RTL_SUB_LEVELS: RTLLevelData[] = [

  // ── Level 0: Semiconductor Foundations ──────────────────────────────────────
  {
    levelId: 0,
    bonusXp: 80,
    badge: "Silicon Initiate",
    subLevels: [
      {
        id: "rtl-0-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "What is VLSI and why does it matter in the modern world.",
        keyPoints: [
          "VLSI = Very Large Scale Integration — millions of transistors on one chip",
          "ASIC: fixed-function chip designed for one purpose (faster, efficient)",
          "FPGA: reconfigurable chip — programmable after manufacture",
          "Frontend: RTL design + verification (logical side)",
          "Backend: physical placement + routing + tapeout (physical side)",
          "Moore's Law: transistor count doubles every ~2 years",
        ],
        content: "VLSI design is the process of creating integrated circuits by combining thousands to billions of transistors on a single chip. The design flow splits into two halves: Frontend (RTL design, simulation, verification) and Backend (synthesis, place and route, signoff). RTL designers write hardware description code in Verilog or SystemVerilog that describes how data flows between registers — hence Register Transfer Level.",
        xp: 20,
      },
      {
        id: "rtl-0-syntax", type: "syntax", title: "Key Terminology", icon: "🔤",
        summary: "Essential VLSI terminology every RTL designer must know.",
        keyPoints: [
          "RTL — Register Transfer Level: describes data flow between flip-flops",
          "Netlist — gate-level representation after synthesis",
          "Tapeout — sending final GDSII to foundry for manufacturing",
          "PPA — Power, Performance, Area: the 3 optimization targets",
          "IP — Intellectual Property: reusable design blocks",
          "DUT — Device Under Test: the module being verified",
        ],
        content: "Key terms form the vocabulary of chip design. Every RTL engineer must know: RTL (behavioral description), netlist (post-synthesis gate list), tapeout (manufacturing submission), PPA trade-offs (you can't optimize all three simultaneously), IP blocks (reused from previous designs or licensed), and DUT (the module your testbench targets).",
        xp: 20,
      },
      {
        id: "rtl-0-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Trace through a complete ASIC design flow from spec to silicon.",
        keyPoints: [
          "Step 1: Specification — define what the chip must do",
          "Step 2: RTL Design — write Verilog/SV behavioral code",
          "Step 3: Simulation — verify behavior with testbench",
          "Step 4: Synthesis — convert RTL to gate netlist",
          "Step 5: Place & Route — physically arrange gates on die",
          "Step 6: Signoff — timing, power, DRC/LVS checks",
          "Step 7: Tapeout — send GDSII to fab",
        ],
        content: "A chip starts as a specification document defining inputs, outputs, protocols, and performance targets. RTL designers then write behavioral Verilog — not worrying about physical gates yet. Verification engineers write testbenches to catch bugs. Synthesis tools convert RTL to a gate netlist. Physical design engineers then place cells and route wires. Finally, signoff checks verify timing closure, power budget, and physical rule compliance before tapeout.",
        xp: 20,
      },
      {
        id: "rtl-0-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Identify and classify chip design flow stages.",
        xp: 30,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 0: Your First Verilog Module

Write a simple Verilog module that declares:
- A module named \`chip_hello\`
- Two input ports: \`clk\` and \`rst_n\`  
- One output port: \`ready\`
- Assign \`ready\` = 1 (always ready)

This is your first step into RTL design!`,
          starterCode: `// Lab 0: Your First Verilog Module
// Complete the module below

module chip_hello (
  // Add your ports here

);

  // Add your logic here

endmodule`,
          hints: [
            "A module starts with 'module name (' and ends with 'endmodule'",
            "Input ports use the 'input' keyword, output ports use 'output'",
            "Use 'assign output_name = value;' for continuous assignment",
            "assign ready = 1'b1; sets ready to logic high",
          ],
          requiredPatterns: [
            "module chip_hello",
            "input",
            "output",
            "clk",
            "rst_n",
            "ready",
            "assign",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "A Verilog module has a name, port list, and logic body. Ports are declared as input or output. The assign statement drives combinational output values continuously.",
        },
      },
      {
        id: "rtl-0-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your understanding of VLSI fundamentals.",
        xp: 25,
        quiz: [
          { q: "What does RTL stand for?", options: ["Real Time Logic", "Register Transfer Level", "Resistor Transistor Logic", "Runtime Transfer Layer"], answer: 1 },
          { q: "Which is reprogrammable after manufacture?", options: ["ASIC", "FPGA", "Both", "Neither"], answer: 1 },
          { q: "What is tapeout?", options: ["Testing on FPGA", "Sending GDSII to fabrication", "Writing testbench", "Running simulation"], answer: 1 },
          { q: "PPA stands for:", options: ["Power, Performance, Area", "Protocol, Process, Architecture", "Pattern, Path, Analysis", "Physical, Place, Assign"], answer: 0 },
        ],
      },
    ],
  },

  // ── Level 1: Digital Logic Mastery ──────────────────────────────────────────
  {
    levelId: 1,
    bonusXp: 100,
    badge: "Logic Gate Master",
    subLevels: [
      {
        id: "rtl-1-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "Boolean algebra and digital logic — the mathematical foundation of all RTL.",
        keyPoints: [
          "Boolean algebra: variables are only 0 or 1",
          "AND gate: output 1 only when ALL inputs are 1",
          "OR gate: output 1 when ANY input is 1",
          "NOT gate: inverts the input",
          "XOR gate: output 1 when inputs DIFFER",
          "NAND/NOR: AND/OR followed by NOT — universal gates",
          "DeMorgan's theorem: NOT(A AND B) = NOT(A) OR NOT(B)",
        ],
        content: "Digital logic is built on Boolean algebra where signals are either 0 (LOW) or 1 (HIGH). Every digital circuit reduces to combinations of AND, OR, NOT gates. Combinational logic has no memory — output depends only on current inputs. Sequential logic uses flip-flops to store state — output depends on current inputs AND past history. RTL design combines both: combinational logic for data processing, sequential flip-flops for state storage.",
        xp: 20,
      },
      {
        id: "rtl-1-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "Verilog syntax for implementing basic digital logic gates.",
        keyPoints: [
          "AND: assign out = a & b;",
          "OR:  assign out = a | b;",
          "NOT: assign out = ~a;",
          "XOR: assign out = a ^ b;",
          "NAND: assign out = ~(a & b);",
          "NOR:  assign out = ~(a | b);",
          "Multi-bit: assign out[3:0] = a[3:0] & b[3:0];",
        ],
        content: "In Verilog, bitwise operators implement logic gates directly. The & operator is AND, | is OR, ~ is NOT, ^ is XOR. These work on single bits or vectors (buses). The assign statement drives a wire continuously — whenever inputs change, output updates immediately. This is combinational logic — no clock needed.",
        xp: 20,
      },
      {
        id: "rtl-1-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Read and understand a complete full adder implementation.",
        keyPoints: [
          "Full adder: adds 3 bits (A, B, Cin) → outputs Sum and Cout",
          "Sum = A XOR B XOR Cin",
          "Cout = (A AND B) OR (Cin AND (A XOR B))",
          "Uses only combinational logic — no clock",
          "Can be chained to make multi-bit adders",
        ],
        content: `// Full Adder — adds A + B + Cin
module full_adder (
  input  a, b, cin,
  output sum, cout
);
  assign sum  = a ^ b ^ cin;        // XOR for sum bit
  assign cout = (a & b) | (cin & (a ^ b)); // carry out
endmodule

// The sum is 1 when an odd number of inputs are 1.
// The carry is 1 when 2 or more inputs are 1.`,
        xp: 20,
      },
      {
        id: "rtl-1-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Implement a 2-to-1 multiplexer using basic logic gates.",
        xp: 35,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 1: 2-to-1 Multiplexer

Implement a 2-to-1 MUX:
- Inputs: \`a\`, \`b\`, \`sel\`
- Output: \`out\`
- When sel=0: out = a
- When sel=1: out = b

**Formula:** out = (sel & b) | (~sel & a)

Module name must be: \`mux2to1\``,
          starterCode: `// Lab 1: 2-to-1 Multiplexer
// When sel=0: out=a, When sel=1: out=b

module mux2to1 (
  input  a,
  input  b,
  input  sel,
  output out
);

  // Implement using assign statement
  // out = ?

endmodule`,
          hints: [
            "A MUX selects between two inputs based on sel signal",
            "When sel=0, output=a. When sel=1, output=b",
            "Use: assign out = sel ? b : a; (ternary operator)",
            "Or use: assign out = (sel & b) | (~sel & a);",
          ],
          requiredPatterns: [
            "module mux2to1",
            "input",
            "output",
            "sel",
            "assign",
            "endmodule",
          ],
          forbiddenPatterns: ["always", "reg"],
          solutionExplanation: "A 2-to-1 MUX uses the select signal to choose between two inputs. The ternary operator (sel ? b : a) is the cleanest Verilog expression. Alternatively, Boolean: (sel & b) | (~sel & a).",
        },
      },
      {
        id: "rtl-1-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your digital logic knowledge.",
        xp: 25,
        quiz: [
          { q: "What is XOR(1,1)?", options: ["0", "1", "X", "Z"], answer: 0 },
          { q: "NAND gate output when A=1, B=1?", options: ["0", "1", "X", "Z"], answer: 0 },
          { q: "Full adder Sum = ?", options: ["A AND B AND Cin", "A XOR B XOR Cin", "A OR B OR Cin", "A NAND B"], answer: 1 },
          { q: "A 2-to-1 MUX has how many select bits?", options: ["0", "1", "2", "3"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 2: Verilog Basics ──────────────────────────────────────────────────
  {
    levelId: 2,
    bonusXp: 110,
    badge: "Verilog Beginner",
    subLevels: [
      {
        id: "rtl-2-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "Verilog fundamentals — the language of RTL design.",
        keyPoints: [
          "Verilog is an HDL — Hardware Description Language, not a programming language",
          "Hardware runs in PARALLEL — multiple always blocks execute simultaneously",
          "wire: connects components, driven by assign or module output",
          "reg: stores value in always block (can be flip-flop or latch)",
          "Two types: combinational (no clock) and sequential (clocked)",
          "module is the basic building block — like a function in SW",
          "Testbench: a Verilog file that tests your design",
        ],
        content: "Verilog describes hardware behavior, not software steps. The key mental shift: everything happens simultaneously. Two always blocks run at the same time. assign statements update continuously. This parallelism is what makes hardware powerful. A Verilog module has ports (inputs/outputs), internal signals (wire/reg), and logic (assign/always blocks).",
        xp: 20,
      },
      {
        id: "rtl-2-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "Core Verilog syntax: modules, ports, wire, reg, assign, always.",
        keyPoints: [
          "module name(port_list); ... endmodule",
          "input [width-1:0] port_name; — input port",
          "output reg [width-1:0] port_name; — registered output",
          "wire [3:0] bus; — 4-bit wire",
          "assign wire_name = expression; — continuous assignment",
          "always @(*) begin ... end — combinational block",
          "always @(posedge clk) begin ... end — sequential block",
          "if/else, case inside always blocks",
        ],
        content: `// Module structure
module my_module (
  input  wire        clk,
  input  wire        rst_n,
  input  wire [7:0]  data_in,
  output reg  [7:0]  data_out
);
  wire [7:0] internal;
  assign internal = data_in + 1;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) data_out <= 8'b0;
    else        data_out <= internal;
  end
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-2-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Trace through a 4-bit adder with carry — understand every line.",
        keyPoints: [
          "input [3:0] means 4-bit wide input bus",
          "output [4:0] — 5 bits to hold carry + sum",
          "assign {cout, sum} = a + b; — concatenation",
          "{cout, sum} packs two signals into one bus",
          "Verilog + operator handles the addition automatically",
        ],
        content: `// 4-bit Adder with Carry
module adder4 (
  input  [3:0] a,        // 4-bit input A
  input  [3:0] b,        // 4-bit input B
  output [3:0] sum,      // 4-bit sum
  output       cout      // carry out
);
  // Concatenate cout and sum into 5-bit result
  assign {cout, sum} = a + b;
  // Example: a=4'b1111(15), b=4'b0001(1)
  // Result = 5'b10000 → cout=1, sum=4'b0000
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-2-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Write a 4-bit ALU with add and subtract operations.",
        xp: 40,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 2: 4-bit ALU

Build a simple ALU that supports:
- \`op = 0\`: out = a + b (addition)
- \`op = 1\`: out = a - b (subtraction)

Ports:
- Inputs: \`a[3:0]\`, \`b[3:0]\`, \`op\`
- Outputs: \`out[3:0]\`, \`zero\` (1 when out==0)

Module name: \`alu4\`

**Hint:** Use a ternary or if-else with assign.`,
          starterCode: `// Lab 2: 4-bit ALU
// op=0: add, op=1: subtract

module alu4 (
  input  [3:0] a,
  input  [3:0] b,
  input        op,
  output [3:0] out,
  output       zero
);

  // Compute result based on op
  assign out  = // your logic here

  // zero flag: 1 when output is all zeros
  assign zero = // your logic here

endmodule`,
          hints: [
            "Use ternary: assign out = op ? (a - b) : (a + b);",
            "zero flag: assign zero = (out == 4'b0);",
            "The == operator returns 1 if equal, 0 if not",
            "Subtraction in Verilog uses the - operator directly",
          ],
          requiredPatterns: [
            "module alu4",
            "input",
            "output",
            "op",
            "assign out",
            "assign zero",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "An ALU uses the op signal to select between operations. The ternary operator (op ? sub : add) elegantly selects results. The zero flag uses equality comparison (out == 0).",
        },
      },
      {
        id: "rtl-2-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your Verilog basics knowledge.",
        xp: 25,
        quiz: [
          { q: "What does 'wire' represent in Verilog?", options: ["A stored value", "A connection between components", "A clock signal", "A module"], answer: 1 },
          { q: "always @(posedge clk) means:", options: ["Run always", "Run on positive clock edge", "Run on negative edge", "Run once"], answer: 1 },
          { q: "What is {cout, sum} in Verilog?", options: ["Addition", "Bit concatenation", "Subtraction", "Module instantiation"], answer: 1 },
          { q: "assign is used for:", options: ["Sequential logic", "Continuous combinational assignment", "Clock generation", "Reset logic"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 3: Advanced Verilog ────────────────────────────────────────────────
  {
    levelId: 3,
    bonusXp: 120,
    badge: "FSM Designer",
    subLevels: [
      {
        id: "rtl-3-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "FSMs, parameterized modules, and advanced Verilog constructs.",
        keyPoints: [
          "FSM = Finite State Machine: system with defined states and transitions",
          "Mealy FSM: output depends on state AND inputs",
          "Moore FSM: output depends only on current state",
          "Two-always FSM style: one for state register, one for next-state/output",
          "parameter keyword: makes modules configurable at instantiation",
          "generate blocks: create repeated hardware structures",
          "Memories: reg arrays, e.g. reg [7:0] mem [0:255]",
        ],
        content: "FSMs are the backbone of control logic in RTL. Every protocol controller, handshake unit, and sequencer is an FSM. The two-always style separates the sequential state register (clocked) from the combinational next-state logic — this is cleaner and synthesis-friendly. Parameters make modules reusable — a parameterized FIFO works for any width or depth.",
        xp: 20,
      },
      {
        id: "rtl-3-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "FSM coding, parameters, case statements, and memory declarations.",
        keyPoints: [
          "parameter WIDTH = 8; — module-level constant",
          "localparam S_IDLE = 2'b00; — state encoding",
          "case (state) inside always block",
          "reg [1:0] state, next_state; — state registers",
          "Always 1: state <= next_state; (sequential)",
          "Always 2: case(state) ... (combinational next-state)",
          "reg [7:0] mem [0:15]; — 16-deep 8-bit memory array",
        ],
        content: `// Two-always FSM template
localparam IDLE = 2'b00, WORK = 2'b01, DONE = 2'b10;
reg [1:0] state, next_state;

// Always 1: sequential — state register
always @(posedge clk or negedge rst_n) begin
  if (!rst_n) state <= IDLE;
  else        state <= next_state;
end

// Always 2: combinational — next state logic
always @(*) begin
  next_state = state; // default: stay
  case (state)
    IDLE: if (start) next_state = WORK;
    WORK: if (done)  next_state = DONE;
    DONE:            next_state = IDLE;
  endcase
end`,
        xp: 20,
      },
      {
        id: "rtl-3-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Read a complete traffic light FSM implementation.",
        keyPoints: [
          "3 states: RED, GREEN, YELLOW",
          "Counter used to time each state",
          "Moore outputs: lights depend only on state",
          "Reset puts system in RED state",
          "Clean two-always structure",
        ],
        content: `// Traffic Light Controller FSM
module traffic_light (
  input clk, rst_n,
  output reg red, green, yellow
);
  localparam RED=2'b00, GREEN=2'b01, YELLOW=2'b10;
  reg [1:0] state, next_state;
  reg [4:0] count;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin state <= RED; count <= 0; end
    else if (count == 5'd29) begin
      state <= next_state; count <= 0;
    end else count <= count + 1;
  end

  always @(*) begin
    case (state)
      RED:    next_state = GREEN;
      GREEN:  next_state = YELLOW;
      YELLOW: next_state = RED;
      default: next_state = RED;
    endcase
  end

  always @(*) begin
    {red, green, yellow} = 3'b000;
    case (state)
      RED:    red    = 1;
      GREEN:  green  = 1;
      YELLOW: yellow = 1;
    endcase
  end
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-3-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Implement a sequence detector FSM for pattern 1011.",
        xp: 45,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 3: Sequence Detector FSM

Design a Moore FSM that detects the sequence **1011** in a serial bit stream.

- Input: \`clk\`, \`rst_n\`, \`bit_in\` (serial input)
- Output: \`detected\` (goes HIGH for 1 cycle when 1011 is detected)

States needed:
- S0: initial/reset state
- S1: received '1'
- S2: received '10'
- S3: received '101'
- S4: received '1011' → detected!

Module name: \`seq_detector\``,
          starterCode: `// Lab 3: Sequence Detector for 1011
module seq_detector (
  input  clk,
  input  rst_n,
  input  bit_in,
  output detected
);

  // State encoding
  localparam S0 = 3'd0, S1 = 3'd1, S2 = 3'd2,
             S3 = 3'd3, S4 = 3'd4;

  reg [2:0] state, next_state;

  // Sequential: state register
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) state <= S0;
    else        state <= next_state;
  end

  // Combinational: next state logic
  always @(*) begin
    next_state = S0; // default
    case (state)
      S0: next_state = bit_in ? S1 : S0;
      S1: // complete the transitions
      S2: // complete the transitions
      S3: // complete the transitions
      S4: next_state = bit_in ? S1 : S0;
    endcase
  end

  // Output: detected when in S4
  assign detected = (state == S4);

endmodule`,
          hints: [
            "S1 (got '1'): if bit_in=1 stay S1, if bit_in=0 go S2",
            "S2 (got '10'): if bit_in=1 go S3, if bit_in=0 go S0",
            "S3 (got '101'): if bit_in=1 go S4, if bit_in=0 go S2",
            "assign detected = (state == S4); — Moore output",
          ],
          requiredPatterns: [
            "module seq_detector",
            "localparam",
            "always @(posedge clk",
            "always @(*)",
            "case (state)",
            "assign detected",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "A sequence detector FSM tracks how many consecutive matching bits have been seen. Each state represents partial pattern match progress. The Moore output fires when the final state is reached.",
        },
      },
      {
        id: "rtl-3-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your FSM and advanced Verilog knowledge.",
        xp: 25,
        quiz: [
          { q: "In a Moore FSM, output depends on:", options: ["Inputs only", "State and inputs", "State only", "Clock only"], answer: 2 },
          { q: "Two-always FSM style separates:", options: ["Inputs and outputs", "Sequential state register and combinational next-state", "Clk and rst", "Parameters and ports"], answer: 1 },
          { q: "localparam vs parameter:", options: ["Same thing", "localparam can't be overridden from outside", "parameter can't be overridden", "localparam is for ports"], answer: 1 },
          { q: "reg [7:0] mem [0:15] declares:", options: ["A 7-bit register", "16 registers of 8 bits each", "8 registers of 16 bits", "A single byte"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 4: SystemVerilog Essentials ────────────────────────────────────────
  {
    levelId: 4,
    bonusXp: 130,
    badge: "SystemVerilog Engineer",
    subLevels: [
      {
        id: "rtl-4-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "SystemVerilog improvements over Verilog for RTL design.",
        keyPoints: [
          "logic type replaces wire/reg ambiguity",
          "always_ff: explicitly marks sequential flip-flop logic",
          "always_comb: explicitly marks combinational logic",
          "always_latch: explicitly marks latch (avoid in RTL!)",
          "enum: named state encoding — cleaner than localparam",
          "struct: group related signals into one type",
          "interface: bundle multiple signals into reusable port group",
        ],
        content: "SystemVerilog (SV) extends Verilog with cleaner RTL constructs. The 'logic' type eliminates confusion between wire and reg — tools infer the right hardware. always_ff/always_comb add intent — the tool warns if your always_ff accidentally has latches. Enums make FSM state encoding readable. Interfaces bundle related signals (like AXI4) into a single port.",
        xp: 20,
      },
      {
        id: "rtl-4-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "SystemVerilog RTL syntax — logic, always_ff, always_comb, enum.",
        keyPoints: [
          "logic clk, rst_n; — replaces wire/reg",
          "logic [7:0] data; — 8-bit logic",
          "always_ff @(posedge clk) — sequential",
          "always_comb begin ... end — combinational",
          "typedef enum logic [1:0] {IDLE, RUN, DONE} state_t;",
          "state_t state, next_state; — typed FSM",
          "struct packed { logic valid; logic [7:0] data; } pkt_t;",
        ],
        content: `// SystemVerilog FSM with enum
module sv_fsm (
  input  logic clk, rst_n, start,
  output logic done
);
  typedef enum logic [1:0] {
    IDLE = 2'b00,
    RUN  = 2'b01,
    DONE = 2'b10
  } state_t;

  state_t state, next_state;

  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) state <= IDLE;
    else        state <= next_state;
  end

  always_comb begin
    next_state = state;
    case (state)
      IDLE: if (start) next_state = RUN;
      RUN:             next_state = DONE;
      DONE:            next_state = IDLE;
    endcase
  end

  assign done = (state == DONE);
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-4-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Convert a Verilog module to clean SystemVerilog style.",
        keyPoints: [
          "Replace wire/reg with logic throughout",
          "Replace always @(posedge clk) with always_ff",
          "Replace always @(*) with always_comb",
          "Replace localparam states with typedef enum",
          "Result: tool can detect unintended latches",
        ],
        content: `// BEFORE: Verilog style
module counter_v (
  input wire clk, rst_n,
  output reg [3:0] count
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= 4'b0;
    else        count <= count + 1;
  end
endmodule

// AFTER: SystemVerilog style
module counter_sv (
  input  logic       clk, rst_n,
  output logic [3:0] count
);
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= '0;  // '0 works for any width
    else        count <= count + 1'b1;
  end
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-4-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Write a 4-bit up/down counter in SystemVerilog.",
        xp: 45,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 4: SystemVerilog Up/Down Counter

Write a 4-bit synchronous counter in **SystemVerilog** style:
- Counts UP when \`dir = 1\`
- Counts DOWN when \`dir = 0\`
- Synchronous active-low reset (\`rst_n\`)
- Use \`always_ff\` and \`logic\` types

Ports:
- Input: \`clk\`, \`rst_n\`, \`dir\`
- Output: \`count[3:0]\`

Module name: \`updown_counter\``,
          starterCode: `// Lab 4: SystemVerilog Up/Down Counter
// Use always_ff and logic types

module updown_counter (
  input  logic       clk,
  input  logic       rst_n,
  input  logic       dir,    // 1=up, 0=down
  output logic [3:0] count
);

  // Use always_ff for sequential logic
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      count <= // reset value
    else if (dir)
      count <= // count up
    else
      count <= // count down
  end

endmodule`,
          hints: [
            "Reset value: count <= 4'b0000; or count <= '0;",
            "Count up: count <= count + 1'b1;",
            "Count down: count <= count - 1'b1;",
            "always_ff requires @(posedge clk) — don't use always @(*)",
          ],
          requiredPatterns: [
            "module updown_counter",
            "logic",
            "always_ff",
            "posedge clk",
            "rst_n",
            "dir",
            "endmodule",
          ],
          forbiddenPatterns: ["always @(posedge", "wire ", "reg "],
          solutionExplanation: "SystemVerilog always_ff explicitly marks this as a flip-flop. The logic type replaces wire/reg. The if-else inside always_ff handles reset and up/down counting.",
        },
      },
      {
        id: "rtl-4-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your SystemVerilog knowledge.",
        xp: 25,
        quiz: [
          { q: "always_ff is used for:", options: ["Combinational logic", "Sequential flip-flop logic", "Latch inference", "Testbench"], answer: 1 },
          { q: "The 'logic' type in SV replaces:", options: ["input/output", "wire and reg", "always/assign", "module/endmodule"], answer: 1 },
          { q: "typedef enum defines:", options: ["A memory", "Named constants for state encoding", "A module type", "An interface"], answer: 1 },
          { q: "'0 in SV means:", options: ["Zero of specific width", "All zeros of any inferred width", "Single bit zero", "Undefined"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 5: RTL Coding Standards ───────────────────────────────────────────
  {
    levelId: 5,
    bonusXp: 140,
    badge: "Clean Code RTL",
    subLevels: [
      {
        id: "rtl-5-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "Industry RTL coding standards that prevent bugs and improve synthesis.",
        keyPoints: [
          "Latch avoidance: always assign default in combinational always",
          "Reset strategy: synchronous vs asynchronous — know both",
          "CDC (Clock Domain Crossing): never connect clocks without synchronizer",
          "Naming convention: _n suffix for active-low, clk_ prefix for clocks",
          "No combinational loops: output must not feed back to input directly",
          "One module per file: easier to read and maintain",
          "Comment every non-obvious line of logic",
        ],
        content: "Industry RTL follows strict coding guidelines to prevent synthesis mismatches, latches, and CDC violations. The most common bug: missing else in an always_comb — creates unintended latch. CDC violations cause intermittent failures only caught in silicon — always use proper synchronizers. Clean naming conventions make code self-documenting.",
        xp: 20,
      },
      {
        id: "rtl-5-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "Patterns to avoid latches, CDC bugs, and common RTL mistakes.",
        keyPoints: [
          "ALWAYS set default before case: next = current;",
          "Synchronous reset: if (!rst_n) in always_ff",
          "Async reset: @(posedge clk or negedge rst_n)",
          "Two-FF synchronizer for CDC crossing",
          "Use full_case and parallel_case pragmas carefully",
          "Avoid #delays in RTL — synthesis ignores them",
          "Never mix blocking (=) and non-blocking (<=) in same block",
        ],
        content: `// LATCH BUG — bad code:
always_comb begin
  case (sel)
    2'b00: out = a;
    2'b01: out = b;
    // Missing 2'b10, 2'b11 → LATCH INFERRED!
  endcase
end

// FIXED — always set default:
always_comb begin
  out = '0; // DEFAULT — prevents latch
  case (sel)
    2'b00: out = a;
    2'b01: out = b;
  endcase
end

// TWO-FF CDC SYNCHRONIZER:
always_ff @(posedge clk_dst) begin
  sync_ff1 <= async_signal;
  sync_ff2 <= sync_ff1;  // use sync_ff2 in dst domain
end`,
        xp: 20,
      },
      {
        id: "rtl-5-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Identify and fix 3 common RTL bugs in real code.",
        keyPoints: [
          "Bug 1: Missing default in case → latch",
          "Bug 2: Blocking assignment in sequential block → wrong behavior",
          "Bug 3: No reset on flip-flop → X propagation at simulation start",
        ],
        content: `// BUG 1: Latch due to incomplete case
always_comb begin
  case (opcode)
    2'b00: result = a + b;  // Missing 01, 10, 11
  endcase                   // → LATCH on result
end
// FIX: result = '0; before case

// BUG 2: Blocking in sequential
always_ff @(posedge clk) begin
  a = b + 1;  // = instead of <=
  c = a + 1;  // c uses updated a — wrong in HW
end
// FIX: use <= for all sequential assignments

// BUG 3: No reset — X propagates
always_ff @(posedge clk) begin
  // No reset! count is X at startup
  count <= count + 1;
end
// FIX: add if (!rst_n) count <= '0;`,
        xp: 20,
      },
      {
        id: "rtl-5-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Fix a broken RTL module with latch and reset bugs.",
        xp: 45,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 5: Fix the Broken RTL

The module below has **3 bugs**:
1. Missing default in always_comb → latch inferred
2. Blocking assignment (=) used in sequential block
3. No reset on the output register

**Fix all 3 bugs** and write the corrected module.

Module name: \`fixed_rtl\``,
          starterCode: `// Lab 5: Fix the Broken RTL
// This module has 3 bugs — find and fix them all

module fixed_rtl (
  input  logic       clk,
  input  logic       rst_n,
  input  logic [1:0] sel,
  input  logic [7:0] a, b, c,
  output logic [7:0] out_reg
);

  logic [7:0] mux_out;

  // BUG 1: Missing default → latch on mux_out
  always_comb begin
    case (sel)
      2'b00: mux_out = a;
      2'b01: mux_out = b;
      2'b10: mux_out = c;
      // missing default!
    endcase
  end

  // BUG 2 + 3: blocking assign, no reset
  always_ff @(posedge clk) begin
    out_reg = mux_out;   // BUG: blocking =, no reset
  end

endmodule`,
          hints: [
            "Bug 1: Add 'mux_out = 8'b0;' before the case statement",
            "Bug 2: Change '=' to '<=' in the always_ff block",
            "Bug 3: Add 'if (!rst_n) out_reg <= 8'b0;' before the else",
            "Final always_ff: if (!rst_n) out_reg <= '0; else out_reg <= mux_out;",
          ],
          requiredPatterns: [
            "module fixed_rtl",
            "always_comb",
            "always_ff",
            "mux_out = 8",
            "if (!rst_n)",
            "out_reg <= mux_out",
            "endmodule",
          ],
          forbiddenPatterns: ["out_reg = mux_out"],
          solutionExplanation: "Three fixes: (1) Add default assignment before case to prevent latch, (2) Change = to <= for non-blocking sequential assignment, (3) Add synchronous reset with if(!rst_n) to prevent X propagation.",
        },
      },
      {
        id: "rtl-5-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your RTL coding standards knowledge.",
        xp: 25,
        quiz: [
          { q: "What causes a latch in an always_comb?", options: ["Missing clock", "Incomplete if/case — output not assigned in all paths", "Using always @(*)", "Too many inputs"], answer: 1 },
          { q: "Non-blocking assignment uses:", options: ["=", "<=", "==", ":="], answer: 1 },
          { q: "CDC stands for:", options: ["Clock Domain Crossing", "Circuit Design Check", "Core Design Closure", "Clock Delay Compensation"], answer: 0 },
          { q: "Two-FF synchronizer is used for:", options: ["Resetting flip-flops", "Safely crossing clock domains", "Generating clocks", "Detecting edges"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 6: Synthesis Concepts ──────────────────────────────────────────────
  {
    levelId: 6,
    bonusXp: 150,
    badge: "Synthesis Aware",
    subLevels: [
      {
        id: "rtl-6-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "How synthesis converts your RTL into a real gate-level netlist.",
        keyPoints: [
          "Synthesis: RTL (behavioral) → gate netlist (structural)",
          "Standard cell library: AND, OR, FF, MUX cells for the process node",
          "Constraints (SDC): tell synthesis the timing requirements",
          "Area optimization: reduce gate count",
          "Speed optimization: minimize critical path delay",
          "Power optimization: reduce switching activity",
          "You can't optimize all 3 simultaneously — trade-offs always",
        ],
        content: "Synthesis is the automated translation of RTL into physical gates. The synthesis tool (Synopsys Design Compiler, Cadence Genus) reads your Verilog, maps it to standard cells from the foundry's library, and optimizes based on your constraints. The SDC (Synopsys Design Constraints) file specifies clock period, input/output delays, and false paths — these guide the optimizer. Understanding synthesis helps you write RTL that produces better hardware.",
        xp: 20,
      },
      {
        id: "rtl-6-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "RTL patterns that synthesize efficiently vs patterns that don't.",
        keyPoints: [
          "Priority encoder: if-else chain → synthesizes to priority MUX tree",
          "Parallel decoder: case → synthesizes to efficient decode logic",
          "Shift operations: << and >> → typically free (just rewire)",
          "Multiplication: * → uses DSP blocks or large multiplier tree",
          "Division: / — very expensive, avoid in RTL if possible",
          "Inference: write behavior, let synthesis pick implementation",
          "Synthesis attributes: (* keep *), (* dont_touch *)",
        ],
        content: `// Efficient: case for parallel decode
always_comb begin
  out = '0;
  case (sel)  // Parallel decode — all paths evaluated simultaneously
    4'h0: out = data0;
    4'h1: out = data1;
    // ...
  endcase
end

// Expensive: cascaded if-else for non-priority decode
// Tools may produce priority encoder instead of parallel mux
always_comb begin
  if      (sel == 4'h0) out = data0;
  else if (sel == 4'h1) out = data1;
  // ...
end

// FREE operation: shift = just reroute wires
assign shifted = data << 2;  // No gates needed!`,
        xp: 20,
      },
      {
        id: "rtl-6-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Understand how a simple Verilog always block maps to actual gates.",
        keyPoints: [
          "always_ff → D flip-flop in standard cell library",
          "assign a & b → AND2 gate",
          "if-else → MUX2 gate",
          "+ operator → Ripple carry adder or carry-lookahead",
          "reset path → goes to the D-FF reset pin",
        ],
        content: `// RTL code:
always_ff @(posedge clk or negedge rst_n) begin
  if (!rst_n) q <= 1'b0;
  else        q <= d & enable;
end

// What synthesis produces (conceptually):
// 1. AND2 gate: and2_inst(.a(d), .b(enable), .y(and_out));
// 2. D flip-flop: dff_inst(.d(and_out), .clk(clk),
//                          .rstn(rst_n), .q(q));
//
// The if(!rst_n) maps to the flip-flop's reset pin
// The & maps to an AND gate feeding the D input
// The always_ff maps to a DFF in the standard cell library`,
        xp: 20,
      },
      {
        id: "rtl-6-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Write synthesis-friendly RTL for an 8-bit barrel shifter.",
        xp: 50,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 6: 8-bit Barrel Shifter

A barrel shifter shifts data by N positions in one clock cycle.

Implement an 8-bit logical left barrel shifter:
- Input: \`data[7:0]\`, \`shift[2:0]\` (shift amount 0-7)
- Output: \`result[7:0]\`
- Logical shift: vacated bits filled with 0

Use a **case statement** for parallel decode (synthesis-friendly).

Module name: \`barrel_shifter\``,
          starterCode: `// Lab 6: 8-bit Barrel Shifter
// Shift data left by 'shift' positions

module barrel_shifter (
  input  logic [7:0] data,
  input  logic [2:0] shift,   // shift amount: 0 to 7
  output logic [7:0] result
);

  // Use case for synthesis-friendly parallel decode
  always_comb begin
    case (shift)
      3'd0: result = data;
      3'd1: result = // shift left by 1
      3'd2: result = // shift left by 2
      3'd3: result = // shift left by 3
      3'd4: result = // shift left by 4
      3'd5: result = // shift left by 5
      3'd6: result = // shift left by 6
      3'd7: result = // shift left by 7
      default: result = data;
    endcase
  end

endmodule`,
          hints: [
            "Shift left by N: result = data << N;",
            "3'd1: result = data << 1; shifts left by 1 (fills with 0)",
            "For an 8-bit result, bits shifted beyond bit 7 are lost",
            "data << 3 shifts left by 3, fills 3 LSBs with 0",
          ],
          requiredPatterns: [
            "module barrel_shifter",
            "always_comb",
            "case (shift)",
            "3'd0",
            "3'd7",
            "default",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "A barrel shifter uses a case statement to select the correctly shifted version of data. Each case entry is a constant shift — synthesis maps this to a tree of multiplexers, much more efficient than iterative shifting.",
        },
      },
      {
        id: "rtl-6-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your synthesis knowledge.",
        xp: 25,
        quiz: [
          { q: "SDC files specify:", options: ["RTL behavior", "Timing constraints for synthesis", "Testbench patterns", "Memory layouts"], answer: 1 },
          { q: "Shift operations in RTL synthesis typically:", options: ["Require many gates", "Are free — just rewire", "Need DSP blocks", "Are not supported"], answer: 1 },
          { q: "Which operation is most expensive in synthesis?", options: ["AND", "OR", "XOR", "Division /"], answer: 3 },
          { q: "A case statement synthesizes to:", options: ["Priority encoder", "Parallel MUX decode logic", "Flip-flop array", "Ring counter"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 7: Timing Basics ───────────────────────────────────────────────────
  {
    levelId: 7,
    bonusXp: 160,
    badge: "Timing Analyst",
    subLevels: [
      {
        id: "rtl-7-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "Setup time, hold time, slack, and critical path — essential timing concepts.",
        keyPoints: [
          "Setup time: data must be stable BEFORE clock edge by Tsetup",
          "Hold time: data must remain stable AFTER clock edge by Thold",
          "Slack = required time − arrival time (positive = timing met)",
          "Critical path: longest combinational path between flip-flops",
          "Tclk ≥ Tcq + Tcomb + Tsetup (setup time equation)",
          "Hold violation: data changes too fast after clock edge",
          "Clock uncertainty: accounts for jitter and skew",
        ],
        content: "Timing is the most critical constraint in RTL design. A setup violation means data doesn't arrive at the next flip-flop in time — the chip runs at the wrong frequency or produces wrong values. A hold violation means data changes too quickly after the clock edge — the flip-flop captures wrong data. RTL designers control timing by reducing combinational logic depth between flip-flops — this is pipelining.",
        xp: 20,
      },
      {
        id: "rtl-7-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "RTL patterns for timing improvement: pipelining and retiming.",
        keyPoints: [
          "Pipeline: insert register stage to break long combinational path",
          "Retiming: move registers across logic without changing behavior",
          "Register output of expensive computation (multiply, divide)",
          "Don't put too much logic between flops — max ~10-15 gate levels",
          "Use timing reports to find critical path and fix it",
          "SDC: create_clock -period 10 [get_ports clk]",
          "Tclk period = 1/frequency (10ns = 100MHz)",
        ],
        content: `// BEFORE: long combinational path — timing violation risk
always_ff @(posedge clk) begin
  result <= (a * b) + (c * d) + (e * f); // 3 multiplies in one cycle!
end

// AFTER: pipelined — breaks into 2 cycles but meets timing
always_ff @(posedge clk) begin
  // Stage 1: compute partial products
  p1 <= a * b;
  p2 <= c * d;
  p3 <= e * f;
end

always_ff @(posedge clk) begin
  // Stage 2: sum the products
  result <= p1 + p2 + p3;
end`,
        xp: 20,
      },
      {
        id: "rtl-7-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Calculate setup slack for a simple path and determine max frequency.",
        keyPoints: [
          "Given: Tcq=0.3ns, Tcomb=7.2ns, Tsetup=0.5ns",
          "Minimum clock period = 0.3 + 7.2 + 0.5 = 8.0ns",
          "Maximum frequency = 1/8ns = 125 MHz",
          "With 10ns clock: slack = 10 - 8 = 2ns (positive = PASS)",
          "With 7ns clock: slack = 7 - 8 = -1ns (negative = FAIL)",
        ],
        content: `// Timing path analysis:
// Launch FF → combinational logic → Capture FF

// Given timing numbers:
// Tcq    = 0.3ns  (clock-to-Q delay of launch FF)
// Tcomb  = 7.2ns  (combinational logic delay)
// Tsetup = 0.5ns  (setup time of capture FF)

// Setup constraint:
// Tclk >= Tcq + Tcomb + Tsetup
// Tclk >= 0.3 + 7.2 + 0.5 = 8.0ns

// With Tclk = 10ns (100MHz):
// Slack = Tclk - (Tcq + Tcomb + Tsetup)
// Slack = 10 - 8 = +2ns → SETUP MET ✓

// To fix a setup violation:
// Option 1: Reduce Tcomb (optimize logic)
// Option 2: Pipeline (add register in middle of path)
// Option 3: Lower frequency (slower clock)`,
        xp: 20,
      },
      {
        id: "rtl-7-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Pipeline a 3-stage multiply-accumulate unit for timing improvement.",
        xp: 50,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 7: Pipelined MAC Unit

A Multiply-Accumulate (MAC) unit computes: result = a × b + c

The single-cycle version has timing issues (multiply + add in one cycle).

**Pipeline it into 2 stages:**
- Stage 1 (reg): product = a × b
- Stage 2 (reg): result = product + c

Inputs: \`clk\`, \`rst_n\`, \`a[7:0]\`, \`b[7:0]\`, \`c[15:0]\`
Output: \`result[15:0]\`

Module name: \`mac_pipelined\``,
          starterCode: `// Lab 7: Pipelined MAC Unit
// Stage 1: multiply, Stage 2: accumulate

module mac_pipelined (
  input  logic        clk,
  input  logic        rst_n,
  input  logic [7:0]  a,
  input  logic [7:0]  b,
  input  logic [15:0] c,
  output logic [15:0] result
);

  // Pipeline stage 1 register
  logic [15:0] product;

  // Stage 1: register the multiply result
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      product <= // reset
    else
      product <= // a * b
  end

  // Stage 2: register the add result
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      result <= // reset
    else
      result <= // product + c
  end

endmodule`,
          hints: [
            "Stage 1 reset: product <= 16'b0;",
            "Stage 1 compute: product <= a * b; (8x8=16-bit result)",
            "Stage 2 reset: result <= 16'b0;",
            "Stage 2 compute: result <= product + c;",
          ],
          requiredPatterns: [
            "module mac_pipelined",
            "logic [15:0] product",
            "always_ff",
            "product <=",
            "result <=",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "Pipelining splits the multiply-accumulate into two register stages. Each stage has less combinational delay, allowing a higher clock frequency. Latency increases by 1 cycle but throughput remains 1 result per cycle.",
        },
      },
      {
        id: "rtl-7-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your timing concepts knowledge.",
        xp: 25,
        quiz: [
          { q: "Setup time violation means:", options: ["Data changes too fast after clock", "Data doesn't arrive in time before clock edge", "Clock is missing", "Reset is wrong"], answer: 1 },
          { q: "Positive slack means:", options: ["Timing violation", "Timing is met with margin", "Hold violation", "Clock too fast"], answer: 1 },
          { q: "Critical path is:", options: ["The clock path", "Longest combinational delay between flip-flops", "The reset path", "The shortest path"], answer: 1 },
          { q: "Pipelining improves:", options: ["Latency", "Throughput and maximum frequency", "Area", "Power only"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 8: Real Protocol RTL ───────────────────────────────────────────────
  {
    levelId: 8,
    bonusXp: 180,
    badge: "Protocol RTL Engineer",
    subLevels: [
      {
        id: "rtl-8-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "Serial communication protocols — UART, SPI, I2C — from an RTL perspective.",
        keyPoints: [
          "UART: asynchronous serial, start/stop bits, configurable baud rate",
          "SPI: synchronous serial, 4 wires (SCLK, MOSI, MISO, CS), full duplex",
          "I2C: synchronous serial, 2 wires (SCL, SDA), multi-master capable",
          "FIFO: First-In-First-Out buffer for clock domain bridging",
          "Handshake: valid/ready protocol for flow control",
          "Every protocol has an FSM controlling transmit/receive",
          "Baud rate = bits per second; clock divider generates it from system clock",
        ],
        content: "Protocol RTL is where FSMs, counters, and shift registers combine to implement real communication interfaces. UART transmitter: load data into shift register, add start/stop bits, shift out one bit per baud period. SPI controller: drive SCLK, shift MOSI out, sample MISO in. I2C: open-drain bus with start/stop conditions and ACK/NACK. FIFOs buffer data between producers and consumers running at different rates.",
        xp: 20,
      },
      {
        id: "rtl-8-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "RTL patterns for UART, shift registers, baud rate generation.",
        keyPoints: [
          "Baud rate divider: counter counts to (clk_freq/baud_rate - 1)",
          "Shift register TX: shift right each baud tick, MSB first",
          "Start bit: drive tx_line LOW for one baud period",
          "Stop bit: drive tx_line HIGH for one baud period",
          "Valid/Ready handshake: producer drives valid, consumer drives ready",
          "FIFO: write pointer, read pointer, full/empty flags",
        ],
        content: `// Baud rate generator (for 9600 baud, 50MHz clk)
// Divider = 50_000_000 / 9600 = 5208
localparam BAUD_DIV = 5208;
logic [12:0] baud_count;
logic baud_tick;

always_ff @(posedge clk or negedge rst_n) begin
  if (!rst_n) baud_count <= '0;
  else if (baud_count == BAUD_DIV-1) baud_count <= '0;
  else baud_count <= baud_count + 1;
end
assign baud_tick = (baud_count == BAUD_DIV-1);

// UART TX shift register
always_ff @(posedge clk) begin
  if (baud_tick && tx_active)
    shift_reg <= {1'b1, shift_reg[7:1]}; // shift right, fill with 1
end`,
        xp: 20,
      },
      {
        id: "rtl-8-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Trace through a complete UART TX module line by line.",
        keyPoints: [
          "IDLE state: tx_line=1, waiting for data",
          "START state: tx_line=0 (start bit) for 1 baud period",
          "DATA state: shift out 8 data bits, LSB first",
          "STOP state: tx_line=1 (stop bit) for 1 baud period",
          "Bit counter tracks which of 8 data bits is being sent",
        ],
        content: `// Simplified UART TX FSM
typedef enum logic [1:0] {IDLE, START, DATA, STOP} tx_state_t;
tx_state_t state;
logic [7:0] shift_reg;
logic [2:0] bit_cnt;

always_ff @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin state <= IDLE; tx <= 1'b1; end
  else if (baud_tick) begin
    case (state)
      IDLE: begin
        tx <= 1'b1;
        if (tx_valid) begin
          shift_reg <= tx_data;
          state     <= START;
        end
      end
      START: begin tx <= 1'b0; state <= DATA; bit_cnt <= 0; end
      DATA: begin
        tx        <= shift_reg[0];   // LSB first
        shift_reg <= {1'b1, shift_reg[7:1]};
        bit_cnt   <= bit_cnt + 1;
        if (bit_cnt == 3'd7) state <= STOP;
      end
      STOP: begin tx <= 1'b1; state <= IDLE; end
    endcase
  end
end`,
        xp: 20,
      },
      {
        id: "rtl-8-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Implement a synchronous FIFO with full and empty flags.",
        xp: 55,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 8: Synchronous FIFO

Implement a 4-deep, 8-bit synchronous FIFO:

- Write when: \`wr_en = 1\` and \`full = 0\`
- Read when: \`rd_en = 1\` and \`empty = 0\`
- \`full\`: asserted when FIFO has 4 entries
- \`empty\`: asserted when FIFO has 0 entries

Ports:
- Input: \`clk\`, \`rst_n\`, \`wr_en\`, \`rd_en\`, \`wr_data[7:0]\`
- Output: \`rd_data[7:0]\`, \`full\`, \`empty\`

Module name: \`sync_fifo\``,
          starterCode: `// Lab 8: Synchronous FIFO (4-deep, 8-bit)
module sync_fifo (
  input  logic       clk,
  input  logic       rst_n,
  input  logic       wr_en,
  input  logic       rd_en,
  input  logic [7:0] wr_data,
  output logic [7:0] rd_data,
  output logic       full,
  output logic       empty
);

  // Memory array: 4 entries of 8 bits
  logic [7:0] mem [0:3];

  // Write and read pointers
  logic [1:0] wr_ptr, rd_ptr;

  // Count of entries in FIFO
  logic [2:0] count;

  // Write logic
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) wr_ptr <= '0;
    else if (wr_en && !full) begin
      mem[wr_ptr] <= wr_data;
      wr_ptr      <= wr_ptr + 1;
    end
  end

  // Read logic
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) rd_ptr <= '0;
    else if (rd_en && !empty) begin
      rd_ptr <= rd_ptr + 1;
    end
  end

  // Count logic
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= '0;
    else begin
      // Update count based on wr_en and rd_en
      // Complete this logic
    end
  end

  // Output and flags
  assign rd_data = mem[rd_ptr];
  assign full    = // complete
  assign empty   = // complete

endmodule`,
          hints: [
            "count increases by 1 when writing but not reading: (wr_en && !full && !(rd_en && !empty))",
            "count decreases by 1 when reading but not writing",
            "count stays same when both reading and writing simultaneously",
            "full = (count == 3'd4); empty = (count == 3'd0);",
          ],
          requiredPatterns: [
            "module sync_fifo",
            "mem [0:3]",
            "wr_ptr",
            "rd_ptr",
            "count",
            "assign full",
            "assign empty",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "A FIFO uses circular buffer with write and read pointers. Count tracks entries — increments on write, decrements on read, unchanged when both happen simultaneously. Full/empty flags prevent overflow/underflow.",
        },
      },
      {
        id: "rtl-8-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your protocol RTL knowledge.",
        xp: 25,
        quiz: [
          { q: "UART is:", options: ["Synchronous serial", "Asynchronous serial", "Parallel bus", "Differential pair"], answer: 1 },
          { q: "SPI uses how many wires?", options: ["2", "3", "4", "8"], answer: 2 },
          { q: "A FIFO is used for:", options: ["Generating clocks", "Buffering data between different rate producers/consumers", "Storing programs", "Routing signals"], answer: 1 },
          { q: "UART start bit is:", options: ["Logic HIGH", "Logic LOW", "High-Z", "A clock pulse"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 9: Industry RTL Projects ──────────────────────────────────────────
  {
    levelId: 9,
    bonusXp: 200,
    badge: "Industry RTL Developer",
    subLevels: [
      {
        id: "rtl-9-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "How industry RTL projects differ from academic exercises.",
        keyPoints: [
          "Industry RTL has strict specs — must match documentation exactly",
          "AXI4-Lite: ARM's standard on-chip bus protocol — everywhere in SoCs",
          "DMA: Direct Memory Access — transfers data without CPU involvement",
          "Cache controller: manages fast SRAM cache for slow main memory",
          "Clock gating: power optimization — disable clock to idle modules",
          "Assertions: embedded checks that fire if design behaves incorrectly",
          "Code review: every line reviewed before integration",
        ],
        content: "Industry RTL is constrained by interface specifications, bus protocols, and timing budgets that don't exist in textbooks. AXI4-Lite is the standard for configuration registers in modern SoCs — if you can implement an AXI4-Lite slave, you can connect to any ARM-based system. DMA controllers are found in every chip — they move data efficiently between memory and peripherals. Understanding these patterns is what separates junior from senior RTL engineers.",
        xp: 20,
      },
      {
        id: "rtl-9-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "AXI4-Lite slave interface signals and handshake patterns.",
        keyPoints: [
          "AXI4-Lite write: AWVALID/AWREADY (addr) + WVALID/WREADY (data) + BVALID/BREADY (resp)",
          "AXI4-Lite read: ARVALID/ARREADY (addr) + RVALID/RREADY (data)",
          "Transfer happens when VALID AND READY are both high",
          "Slave must not deassert VALID once asserted (READY can toggle)",
          "BRESP/RRESP: 2'b00=OKAY, 2'b10=SLVERR",
          "Address decoding: which register to read/write based on AWADDR/ARADDR",
        ],
        content: `// AXI4-Lite write channel handshake
// Transfer occurs when both valid AND ready are high
always_ff @(posedge clk) begin
  // Address channel: latch address when handshake occurs
  if (s_awvalid && s_awready) begin
    wr_addr <= s_awaddr;
    wr_addr_valid <= 1'b1;
  end
  // Data channel: latch data when handshake occurs
  if (s_wvalid && s_wready) begin
    wr_data <= s_wdata;
    wr_strobe <= s_wstrb;
    wr_data_valid <= 1'b1;
  end
  // Write to register when both addr and data received
  if (wr_addr_valid && wr_data_valid) begin
    case (wr_addr[7:0])
      8'h00: reg0 <= wr_data;
      8'h04: reg1 <= wr_data;
    endcase
  end
end`,
        xp: 20,
      },
      {
        id: "rtl-9-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Read through a complete AXI4-Lite slave register file.",
        keyPoints: [
          "4 registers: CTRL (0x00), STATUS (0x04), DATA (0x08), IRQ (0x0C)",
          "Write path: decode AWADDR, wait for WVALID, update register",
          "Read path: decode ARADDR, return register value on RDATA",
          "RVALID asserted one cycle after ARVALID+ARREADY handshake",
          "BVALID asserted after write completes",
        ],
        content: `// AXI4-Lite Read Path (simplified):
typedef enum logic [1:0] {RD_IDLE, RD_ADDR, RD_DATA} rd_state_t;
rd_state_t rd_state;

always_ff @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin
    rd_state  <= RD_IDLE;
    s_rvalid  <= 1'b0;
    s_arready <= 1'b1; // ready to accept address
  end else begin
    case (rd_state)
      RD_IDLE: begin
        if (s_arvalid && s_arready) begin
          // Decode which register to read
          case (s_araddr[3:0])
            4'h0: s_rdata <= ctrl_reg;
            4'h4: s_rdata <= status_reg;
            4'h8: s_rdata <= data_reg;
            default: s_rdata <= 32'hDEADBEEF;
          endcase
          s_arready <= 1'b0;
          s_rvalid  <= 1'b1;
          rd_state  <= RD_DATA;
        end
      end
      RD_DATA: begin
        if (s_rvalid && s_rready) begin // master accepted data
          s_rvalid  <= 1'b0;
          s_arready <= 1'b1;
          rd_state  <= RD_IDLE;
        end
      end
    endcase
  end
end`,
        xp: 20,
      },
      {
        id: "rtl-9-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Implement a simple AXI4-Lite slave with 2 read/write registers.",
        xp: 60,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 9: Simple AXI4-Lite Slave

Implement a minimal AXI4-Lite slave with:
- **REG0** at offset 0x00 (read/write)
- **REG1** at offset 0x04 (read/write)

Write path (simplified — no FSM needed for this lab):
- When \`wr_en\` and \`addr[2]\` = 0: write to REG0
- When \`wr_en\` and \`addr[2]\` = 1: write to REG1

Read path:
- When \`addr[2]\` = 0: rd_data = REG0
- When \`addr[2]\` = 1: rd_data = REG1

Ports:
- Input: \`clk\`, \`rst_n\`, \`wr_en\`, \`rd_en\`, \`addr[7:0]\`, \`wr_data[31:0]\`
- Output: \`rd_data[31:0]\`

Module name: \`axi_regfile\``,
          starterCode: `// Lab 9: AXI4-Lite Register File (simplified)
module axi_regfile (
  input  logic        clk,
  input  logic        rst_n,
  input  logic        wr_en,
  input  logic        rd_en,
  input  logic [7:0]  addr,
  input  logic [31:0] wr_data,
  output logic [31:0] rd_data
);

  logic [31:0] reg0, reg1;

  // Write logic
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      reg0 <= 32'b0;
      reg1 <= 32'b0;
    end else if (wr_en) begin
      case (addr[2])
        1'b0: reg0 <= wr_data;
        1'b1: // write to reg1
      endcase
    end
  end

  // Read logic
  always_comb begin
    rd_data = 32'b0;
    if (rd_en) begin
      case (addr[2])
        1'b0: rd_data = // read reg0
        1'b1: rd_data = // read reg1
      endcase
    end
  end

endmodule`,
          hints: [
            "Write reg1: 1'b1: reg1 <= wr_data;",
            "Read reg0: 1'b0: rd_data = reg0;",
            "Read reg1: 1'b1: rd_data = reg1;",
            "addr[2] is bit 2 of address — selects between REG0 (0x00) and REG1 (0x04)",
          ],
          requiredPatterns: [
            "module axi_regfile",
            "logic [31:0] reg0",
            "logic [31:0] reg1",
            "always_ff",
            "always_comb",
            "addr[2]",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "An AXI4-Lite register file uses address decoding to route reads and writes to the correct register. Bit 2 of the address distinguishes 0x00 (REG0) from 0x04 (REG1). Write path is sequential (registers need flip-flops), read path is combinational.",
        },
      },
      {
        id: "rtl-9-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your industry RTL knowledge.",
        xp: 25,
        quiz: [
          { q: "AXI4-Lite transfer occurs when:", options: ["VALID is high", "READY is high", "Both VALID and READY are high", "Either is high"], answer: 2 },
          { q: "DMA stands for:", options: ["Direct Memory Access", "Dynamic Module Allocation", "Data Management Array", "Digital Memory Address"], answer: 0 },
          { q: "BRESP = 2'b00 means:", options: ["Slave error", "Decode error", "OKAY response", "Exclusive OKAY"], answer: 2 },
          { q: "Clock gating is used for:", options: ["Generating faster clocks", "Power reduction by disabling idle module clocks", "Fixing timing violations", "CDC crossing"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 10: Verification for RTL ──────────────────────────────────────────
  {
    levelId: 10,
    bonusXp: 200,
    badge: "RTL Verification Ready",
    subLevels: [
      {
        id: "rtl-10-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "How RTL designers write basic testbenches and use assertions.",
        keyPoints: [
          "Testbench: Verilog/SV module that drives inputs and checks outputs",
          "DUT: Device Under Test — the RTL module being tested",
          "$display: print to console (for debug)",
          "$monitor: auto-print when signals change",
          "SVA: SystemVerilog Assertions — properties that must always hold",
          "Immediate assertion: assert (condition) in procedural code",
          "Concurrent assertion: property checked every clock cycle",
        ],
        content: "Every RTL designer must be able to write a basic testbench. While verification engineers build comprehensive UVM environments, RTL designers need quick sanity checks. A testbench has no ports — it instantiates the DUT, drives inputs, and checks outputs. SystemVerilog assertions (SVA) can be embedded in the RTL itself to catch bugs during simulation — like self-test circuits.",
        xp: 20,
      },
      {
        id: "rtl-10-syntax", type: "syntax", title: "Syntax & Patterns", icon: "🔤",
        summary: "Testbench structure, assertions, and simulation control.",
        keyPoints: [
          "module tb_name; — no ports on testbench",
          "DUT_name dut (.port(signal)); — DUT instantiation",
          "initial begin ... end — stimulus generation",
          "#10 — delay 10 time units",
          "$display(\"value=%0d\", var); — printf style",
          "assert (a == b) else $error(\"Mismatch!\");",
          "$finish; — end simulation",
        ],
        content: `// Basic testbench template
module tb_adder;
  logic [3:0] a, b;
  logic [4:0] result;

  // Instantiate DUT
  adder4 dut (.a(a), .b(b), .sum(result[3:0]), .cout(result[4]));

  initial begin
    // Test case 1
    a = 4'd5; b = 4'd3;
    #10;
    assert (result == 5'd8) else $error("FAIL: 5+3=%0d", result);

    // Test case 2
    a = 4'd15; b = 4'd1;
    #10;
    assert (result == 5'd16) else $error("FAIL: 15+1=%0d", result);

    $display("All tests passed!");
    $finish;
  end
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-10-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Trace through a clocked testbench with reset sequence.",
        keyPoints: [
          "Generate clock: forever #5 clk = ~clk;",
          "Apply reset: rst_n=0 for a few cycles, then rst_n=1",
          "Wait for clock edge: @(posedge clk);",
          "Check output after setup time: #1 assert(out == expected);",
          "Use $monitor for automatic signal tracing",
        ],
        content: `// Clocked testbench with reset sequence
module tb_counter;
  logic clk = 0, rst_n;
  logic [3:0] count;

  // Instantiate DUT
  updown_counter dut (.clk(clk), .rst_n(rst_n),
                      .dir(1'b1), .count(count));

  // Clock generation: 10ns period
  always #5 clk = ~clk;

  initial begin
    // Apply reset
    rst_n = 0;
    repeat(3) @(posedge clk); // hold reset 3 cycles
    rst_n = 1;

    // Check it starts at 0
    @(posedge clk); #1;
    assert (count == 4'd0) else $error("Reset failed");

    // Count up a few cycles
    repeat(5) @(posedge clk);
    #1;
    assert (count == 4'd5) else $error("Count wrong: %0d", count);

    $display("Counter test PASSED");
    $finish;
  end
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-10-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Write a testbench for the 4-bit ALU from Level 2.",
        xp: 55,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 10: Write a Testbench for ALU4

Write a testbench for the \`alu4\` module from Level 2.

The ALU has:
- Inputs: \`a[3:0]\`, \`b[3:0]\`, \`op\` (0=add, 1=sub)
- Outputs: \`out[3:0]\`, \`zero\`

Your testbench must test at least:
1. Addition: 5 + 3 = 8, zero=0
2. Subtraction: 8 - 8 = 0, zero=1
3. Addition overflow: 15 + 1 = 0 (4-bit wrap), zero=1

Module name: \`tb_alu4\`

Use \`assert\` with \`$error\` for checking results.`,
          starterCode: `// Lab 10: Testbench for alu4
module tb_alu4;

  // Declare signals matching alu4 ports
  logic [3:0] a, b;
  logic       op;
  logic [3:0] out;
  logic       zero;

  // Instantiate the ALU
  alu4 dut (
    .a    (a),
    .b    (b),
    .op   (op),
    .out  (out),
    .zero (zero)
  );

  initial begin
    // Test 1: Addition 5 + 3 = 8
    a = 4'd5; b = 4'd3; op = 1'b0;
    #10;
    assert (out == 4'd8 && zero == 1'b0)
      else $error("Test1 FAIL: out=%0d zero=%0d", out, zero);

    // Test 2: Subtraction 8 - 8 = 0 (zero flag)
    a = // fill in
    b = // fill in
    op = 1'b1;
    #10;
    assert (// fill in condition)
      else $error("Test2 FAIL");

    // Test 3: Overflow 15 + 1 wraps to 0
    // fill in test 3

    $display("All ALU tests passed!");
    $finish;
  end

endmodule`,
          hints: [
            "Test 2: a=4'd8, b=4'd8, op=1'b1 → out=0, zero=1",
            "Test 3: a=4'd15, b=4'd1, op=1'b0 → out=0 (overflow), zero=1",
            "assert condition: (out == expected && zero == expected_zero)",
            "Remember: 4-bit arithmetic wraps: 15+1 = 16 = 0 in 4 bits",
          ],
          requiredPatterns: [
            "module tb_alu4",
            "alu4 dut",
            "assert",
            "else $error",
            "$display",
            "$finish",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "A good testbench covers normal cases, edge cases (overflow, zero flag), and boundary conditions. Each assert checks the exact expected output — if it fails, $error shows which test failed and with what values.",
        },
      },
      {
        id: "rtl-10-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Test your testbench and verification knowledge.",
        xp: 25,
        quiz: [
          { q: "A testbench module has:", options: ["Input ports only", "Output ports only", "No ports", "Same ports as DUT"], answer: 2 },
          { q: "always #5 clk = ~clk generates:", options: ["A reset", "A clock with 10ns period", "A data pattern", "An assertion"], answer: 1 },
          { q: "assert (cond) else $error fires when:", options: ["Condition is true", "Condition is false", "Always", "Never"], answer: 1 },
          { q: "$finish does what?", options: ["Prints to console", "Ends simulation", "Resets DUT", "Starts testbench"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 11: Placement Readiness ───────────────────────────────────────────
  {
    levelId: 11,
    bonusXp: 220,
    badge: "RTL Interview Ready",
    subLevels: [
      {
        id: "rtl-11-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "What RTL interviews at top companies actually test.",
        keyPoints: [
          "Digital logic: gates, K-maps, minimization — always asked",
          "Verilog coding: write module on whiteboard in 10 minutes",
          "FSM design: given spec → state diagram → code",
          "Debugging: find the bug in given RTL snippet",
          "Timing: setup/hold, pipelining, CDC — frequently asked",
          "FIFO design: implementation + full/empty flag logic",
          "Companies: Qualcomm, Intel, NVIDIA, AMD, MediaTek, Apple",
        ],
        content: "RTL interviews at top VLSI companies test a combination of fundamentals and practical coding. You will be asked to design FSMs on the spot, explain timing concepts with numbers, debug broken RTL, and discuss CDC solutions. The best preparation is writing a lot of RTL code. Companies like Qualcomm test protocol knowledge (UART, SPI, AXI). NVIDIA focuses heavily on SystemVerilog and verification concepts. Intel tests timing analysis deeply.",
        xp: 20,
      },
      {
        id: "rtl-11-syntax", type: "syntax", title: "Common Interview Patterns", icon: "🔤",
        summary: "The top 10 RTL patterns asked in every VLSI interview.",
        keyPoints: [
          "1. D flip-flop with sync/async reset",
          "2. N-bit counter with enable and load",
          "3. Shift register (SIPO, PISO, SISO, PIPO)",
          "4. 2-to-1, 4-to-1 MUX",
          "5. Priority encoder",
          "6. Gray code counter",
          "7. Parameterized FIFO",
          "8. Synchronizer for CDC",
          "9. Mealy/Moore FSM from spec",
          "10. One-hot encoded FSM",
        ],
        content: `// Gray code counter (common interview question)
// Gray code: only 1 bit changes between consecutive values
module gray_counter #(parameter N = 4) (
  input  logic         clk, rst_n,
  output logic [N-1:0] gray_out
);
  logic [N-1:0] binary;

  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) binary <= '0;
    else        binary <= binary + 1'b1;
  end

  // Binary to Gray conversion: gray = binary XOR (binary >> 1)
  assign gray_out = binary ^ (binary >> 1);
endmodule`,
        xp: 20,
      },
      {
        id: "rtl-11-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Solve a complete FSM interview question step by step.",
        keyPoints: [
          "Interview Q: Design a vending machine controller",
          "Accepts 5¢ and 10¢ coins, item costs 15¢",
          "Outputs: dispense (item dispensed), change (5¢ returned)",
          "Step 1: List states (0¢, 5¢, 10¢, 15¢)",
          "Step 2: Draw state transition diagram",
          "Step 3: Encode states and write Verilog",
        ],
        content: `// Vending Machine FSM — classic interview question
// Item costs 15 cents. Accepts nickel(5c) and dime(10c)
typedef enum logic [1:0] {S0=2'b00, S5=2'b01,
                           S10=2'b10, S15=2'b11} state_t;
state_t state, next_state;

// Input: nickel, dime. Output: dispense, change
always_comb begin
  next_state = state; dispense = 0; change = 0;
  case (state)
    S0:  if (nickel) next_state = S5;
         else if (dime) next_state = S10;
    S5:  if (nickel) next_state = S10;
         else if (dime) next_state = S15;
    S10: if (nickel) next_state = S15;
         else if (dime) begin
           next_state = S15; change = 1; // give 5c change
         end
    S15: begin dispense = 1; next_state = S0; end
  endcase
end`,
        xp: 20,
      },
      {
        id: "rtl-11-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Implement a Gray code counter — the classic interview question.",
        xp: 60,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 11: Gray Code Counter

Implement a parameterized Gray code counter.

Gray code: only 1 bit changes between consecutive values.
- 0000 → 0001 → 0011 → 0010 → 0110 → ...

**Conversion:** gray = binary XOR (binary >> 1)

Requirements:
- Parameter \`N\` for bit width (default 4)
- Synchronous active-low reset
- Binary counter internally, output in Gray code

Ports:
- Input: \`clk\`, \`rst_n\`
- Output: \`gray_out[N-1:0]\`

Module name: \`gray_counter\``,
          starterCode: `// Lab 11: Parameterized Gray Code Counter
module gray_counter #(
  parameter N = 4
) (
  input  logic         clk,
  input  logic         rst_n,
  output logic [N-1:0] gray_out
);

  // Internal binary counter
  logic [N-1:0] binary;

  // Sequential: count in binary
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      binary <= // reset
    else
      binary <= // increment
  end

  // Combinational: convert binary to Gray
  // gray = binary XOR (binary >> 1)
  assign gray_out = // complete this

endmodule`,
          hints: [
            "Reset: binary <= {N{1'b0}}; or simply '0",
            "Increment: binary <= binary + 1'b1;",
            "Gray conversion: gray_out = binary ^ (binary >> 1);",
            "The >> operator shifts right, filling MSBs with 0",
          ],
          requiredPatterns: [
            "module gray_counter",
            "parameter N",
            "always_ff",
            "rst_n",
            "binary",
            "assign gray_out",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "Gray code counter internally uses a binary counter and converts to Gray code combinationally. The conversion formula (binary XOR binary>>1) ensures only one bit changes between consecutive values — critical for metastability prevention in CDCs.",
        },
      },
      {
        id: "rtl-11-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Interview-style RTL questions.",
        xp: 25,
        quiz: [
          { q: "Gray code ensures between consecutive values:", options: ["All bits change", "Only 1 bit changes", "2 bits change", "MSB changes"], answer: 1 },
          { q: "Binary to Gray conversion:", options: ["gray = binary + 1", "gray = binary XOR (binary >> 1)", "gray = ~binary", "gray = binary - 1"], answer: 1 },
          { q: "One-hot encoding for 4 states uses:", options: ["2 bits", "3 bits", "4 bits", "8 bits"], answer: 2 },
          { q: "Which interview topic is MOST common for RTL roles?", options: ["PCB design", "FSM design + Verilog coding", "Linux kernel", "Web development"], answer: 1 },
        ],
      },
    ],
  },

  // ── Level 12: Elite Final Boss ───────────────────────────────────────────────
  {
    levelId: 12,
    bonusXp: 500,
    badge: "RTL Architect",
    subLevels: [
      {
        id: "rtl-12-concept", type: "concept", title: "Concept", icon: "📚",
        summary: "Complete RISC-V datapath architecture — the final challenge.",
        keyPoints: [
          "RISC-V is an open-source ISA (Instruction Set Architecture)",
          "Datapath: ALU + Register File + PC + Instruction Memory",
          "5-stage pipeline: IF → ID → EX → MEM → WB",
          "Hazards: data hazard (forwarding), control hazard (branch prediction)",
          "ALU operations: ADD, SUB, AND, OR, XOR, SLT, shifts",
          "Register file: 32 registers × 32 bits, 2 read ports, 1 write port",
          "Control unit: decodes opcode → generates ALU control signals",
        ],
        content: "A RISC-V processor datapath integrates all RTL concepts: FSM (control unit), register file (memory), ALU (arithmetic), program counter (sequential logic), and instruction fetch/decode. Building even a simple single-cycle RISC-V is the ultimate RTL exercise. The register file needs two simultaneous read ports and one write port. The ALU must support all RISC-V R-type operations. The control unit is a large FSM/decoder mapping opcodes to control signals.",
        xp: 30,
      },
      {
        id: "rtl-12-syntax", type: "syntax", title: "Datapath Components", icon: "🔤",
        summary: "RTL implementation of RISC-V datapath building blocks.",
        keyPoints: [
          "Register file: 32×32 bit array, rd port A, rd port B, wr port",
          "ALU: 32-bit operations driven by 4-bit alu_ctrl",
          "PC: 32-bit register, increments by 4 each cycle",
          "Immediate generator: sign-extends 12-bit immediate to 32-bit",
          "Control unit: opcode[6:0] → RegWrite, MemRead, ALUSrc, Branch",
        ],
        content: `// RISC-V Register File
module reg_file (
  input  logic        clk,
  input  logic        wr_en,
  input  logic [4:0]  rs1, rs2, rd,
  input  logic [31:0] wr_data,
  output logic [31:0] rd_data1, rd_data2
);
  logic [31:0] regs [0:31];
  // x0 is always 0 in RISC-V
  assign rd_data1 = (rs1 == 5'b0) ? 32'b0 : regs[rs1];
  assign rd_data2 = (rs2 == 5'b0) ? 32'b0 : regs[rs2];

  always_ff @(posedge clk) begin
    if (wr_en && rd != 5'b0)
      regs[rd] <= wr_data;
  end
endmodule`,
        xp: 30,
      },
      {
        id: "rtl-12-walkthrough", type: "walkthrough", title: "Walkthrough", icon: "👀",
        summary: "Trace an ADD instruction through the complete RISC-V datapath.",
        keyPoints: [
          "IF: PC→ fetch instruction from memory",
          "ID: decode opcode, read rs1 and rs2 from register file",
          "EX: ALU computes rs1 + rs2",
          "MEM: ADD doesn't access memory — passthrough",
          "WB: write ALU result back to rd in register file",
        ],
        content: `// ADD x3, x1, x2  — adds register x1 and x2, stores in x3
// Instruction encoding: [31:25]=0000000, [24:20]=rs2=x2,
//                       [19:15]=rs1=x1, [14:12]=000,
//                       [11:7]=rd=x3, [6:0]=0110011 (R-type)

// Stage 1 - IF:
//   PC = 0x1000
//   instr = mem[0x1000] = 32'h00208133

// Stage 2 - ID:
//   opcode = 7'b0110011 (R-type)
//   rs1 = 5'd1 (x1), rs2 = 5'd2 (x2), rd = 5'd3 (x3)
//   Read: rd_data1 = regs[1], rd_data2 = regs[2]
//   alu_ctrl = 4'b0010 (ADD)

// Stage 3 - EX:
//   alu_result = rd_data1 + rd_data2

// Stage 4 - MEM:
//   No memory access (not a load/store)

// Stage 5 - WB:
//   regs[3] <= alu_result
//   PC <= PC + 4`,
        xp: 30,
      },
      {
        id: "rtl-12-lab", type: "lab", title: "Lab", icon: "⚗️",
        summary: "Implement a 32-bit RISC-V ALU supporting all R-type operations.",
        xp: 80,
        lab: {
          editorLanguage: "verilog",
          instructions: `# Lab 12: RISC-V ALU — Final Boss

Implement a 32-bit RISC-V ALU that supports:

| alu_ctrl | Operation        |
|----------|-----------------|
| 4'b0000  | AND             |
| 4'b0001  | OR              |
| 4'b0010  | ADD             |
| 4'b0110  | SUB             |
| 4'b0111  | SLT (set < than)|
| 4'b1100  | NOR             |
| 4'b0011  | XOR             |
| 4'b0100  | SLL (shift left)|
| 4'b0101  | SRL (shift right)|

Outputs:
- \`result[31:0]\`: operation result
- \`zero\`: HIGH when result == 0

Module name: \`riscv_alu\``,
          starterCode: `// Lab 12: RISC-V ALU — Final Boss
module riscv_alu (
  input  logic [31:0] a,
  input  logic [31:0] b,
  input  logic [3:0]  alu_ctrl,
  output logic [31:0] result,
  output logic        zero
);

  always_comb begin
    result = 32'b0; // default
    case (alu_ctrl)
      4'b0000: result = // AND
      4'b0001: result = // OR
      4'b0010: result = // ADD
      4'b0110: result = // SUB
      4'b0111: result = // SLT: result=1 if a < b (signed), else 0
      4'b1100: result = // NOR
      4'b0011: result = // XOR
      4'b0100: result = // SLL: shift left by b[4:0]
      4'b0101: result = // SRL: shift right by b[4:0]
      default: result = 32'b0;
    endcase
  end

  assign zero = (result == 32'b0);

endmodule`,
          hints: [
            "AND: result = a & b;",
            "OR:  result = a | b;",
            "ADD: result = a + b;",
            "SUB: result = a - b;",
            "SLT: result = ($signed(a) < $signed(b)) ? 32'd1 : 32'd0;",
            "NOR: result = ~(a | b);",
            "XOR: result = a ^ b;",
            "SLL: result = a << b[4:0]; (only lower 5 bits for shift amount)",
            "SRL: result = a >> b[4:0];",
          ],
          requiredPatterns: [
            "module riscv_alu",
            "always_comb",
            "case (alu_ctrl)",
            "4'b0000",
            "4'b0010",
            "4'b0110",
            "4'b0111",
            "assign zero",
            "endmodule",
          ],
          forbiddenPatterns: [],
          solutionExplanation: "The RISC-V ALU is the heart of the processor datapath. Each case maps a control code to an operation. SLT uses $signed() for signed comparison. Shift amounts use only b[4:0] since 5 bits can express 0-31 (max shift for 32-bit). The zero flag feeds the branch condition logic.",
        },
      },
      {
        id: "rtl-12-quiz", type: "quiz", title: "Quiz", icon: "🧠",
        summary: "Final boss quiz — RISC-V and advanced RTL.",
        xp: 30,
        quiz: [
          { q: "RISC-V register x0 is:", options: ["General purpose", "Always hardwired to 0", "Program counter", "Stack pointer"], answer: 1 },
          { q: "5-stage RISC-V pipeline stages:", options: ["Fetch, Decode, Execute, Memory, Writeback", "Fetch, Execute, Store, Load, Write", "Read, Compute, Write, Check, Done", "IF, IR, EX, WB, DM"], answer: 0 },
          { q: "Data hazard in pipeline is solved by:", options: ["Stalling only", "Branch prediction", "Forwarding/bypassing", "Increasing clock"], answer: 2 },
          { q: "$signed(a) in SV is used for:", options: ["Converting to ASCII", "Signed arithmetic comparison", "Printing values", "Creating registers"], answer: 1 },
        ],
      },
    ],
  },
];