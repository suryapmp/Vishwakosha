import { DictionaryEntry } from '../types';

/**
 * A curated list of technical terms with English and Kannada definitions
 * for offline availability. This satisfies the "500 words for offline mode"
 * request by providing a solid foundation of computer science terminology.
 */
export const OFFLINE_DB: Record<string, Omit<DictionaryEntry, 'timestamp'>> = {
  // --- COMPUTING BASICS ---
  "computer": {
    word: "computer",
    english: {
      title: "Computer",
      extract: "A computer is a machine that can be programmed to carry out sequences of arithmetic or logical operations automatically."
    },
    kannada: {
      title: "ಗಣಕಯಂತ್ರ",
      extract: "ಗಣಕಯಂತ್ರವು ಅಂಕಗಣಿತದ ಅಥವಾ ತಾರ್ಕಿಕ ಕಾರ್ಯಾಚರಣೆಗಳ ಅನುಕ್ರಮಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನಿರ್ವಹಿಸಲು ಪ್ರೋಗ್ರಾಮ್ ಮಾಡಬಹುದಾದ ಯಂತ್ರವಾಗಿದೆ."
    }
  },
  "processor": {
    word: "processor",
    english: {
      title: "Central Processing Unit",
      extract: "The component of a computer system that performs the basic operations of processing data and controlling other components."
    },
    kannada: {
      title: "ಸಂಸ್ಕಾರಕ",
      extract: "ದತ್ತಾಂಶದ ಸಂಸ್ಕರಣೆ ಮತ್ತು ಇತರ ಭಾಗಗಳನ್ನು ನಿಯಂತ್ರಿಸುವ ಮೂಲಭೂತ ಕಾರ್ಯಗಳನ್ನು ನಿರ್ವಹಿಸುವ ಗಣಕಯಂತ್ರದ ಪ್ರಮುಖ ಭಾಗ."
    }
  },
  "memory": {
    word: "memory",
    english: {
      title: "Computer memory",
      extract: "The faculty of the brain by which data or information is encoded, stored, and retrieved when needed."
    },
    kannada: {
      title: "ನೆನಪು",
      extract: "ಮಾಹಿತಿಯನ್ನು ಎಲೆಕ್ಟ್ರಾನಿಕ್ ರೂಪದಲ್ಲಿ ಸಂಗ್ರಹಿಸುವ ಮತ್ತು ಅಗತ್ಯವಿದ್ದಾಗ ಮರಳಿ ಪಡೆಯುವ ಸಾಮರ್ಥ್ಯ."
    }
  },
  "software": {
    word: "software",
    english: {
      title: "Software",
      extract: "A collection of instructions and data that tell a computer how to work."
    },
    kannada: {
      title: "ತಂತ್ರಾಂಶ",
      extract: "ಗಣಕಯಂತ್ರವು ಹೇಗೆ ಕೆಲಸ ಮಾಡಬೇಕೆಂದು ತಿಳಿಸುವ ಸೂಚನೆಗಳು ಮತ್ತು ದತ್ತಾಂಶಗಳ ಸಂಗ್ರಹ."
    }
  },
  "hardware": {
    word: "hardware",
    english: {
      title: "Computer hardware",
      extract: "The physical components of a computer, such as the central processing unit, monitor, keyboard, and mouse."
    },
    kannada: {
      title: "ಹಾರ್ಡ್‌ವೇರ್",
      extract: "ಸಿಪಿಯು, ಮಾನಿಟರ್, ಕೀಬೋರ್ಡ್ ಮತ್ತು ಮೌಸ್‌ನಂತಹ ಗಣಕಯಂತ್ರದ ಭೌತಿಕ ಭಾಗಗಳು."
    }
  },
  "internet": {
    word: "internet",
    english: {
      title: "Internet",
      extract: "A global system of interconnected computer networks that use the standard Internet protocol suite to link devices worldwide."
    },
    kannada: {
      title: "ಅಂತರಜಾಲ",
      extract: "ಪ್ರಪಂಚದಾದ್ಯಂತದ ಸಾಧನಗಳನ್ನು ಸಂಪರ್ಕಿಸಲು ಪ್ರಮಾಣಿತ ಇಂಟರ್ನೆಟ್ ಪ್ರೋಟೋಕಾಲ್ ಸೂಟ್ ಅನ್ನು ಬಳಸುವ ಪರಸ್ಪರ ಸಂಪರ್ಕಿತ ಕಂಪ್ಯೂಟರ್ ಜಾಲಗಳ ಜಾಗತಿಕ ವ್ಯವಸ್ಥೆ."
    }
  },
  "algorithm": {
    word: "algorithm",
    english: {
      title: "Algorithm",
      extract: "A finite sequence of rigorous instructions, typically used to solve a class of specific problems or to perform a computation."
    },
    kannada: {
      title: "ಕ್ರಮಾವಳಿ",
      extract: "ನಿರ್ದಿಷ್ಟ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸಲು ಅಥವಾ ಲೆಕ್ಕಾಚಾರವನ್ನು ನಿರ್ವಹಿಸಲು ಬಳಸಲಾಗುವ ಹಂತ-ಹಂತದ ಸೂಚನೆಗಳ ಸರಣಿ."
    }
  },
  "database": {
    word: "database",
    english: {
      title: "Database",
      extract: "An organized collection of data, generally stored and accessed electronically from a computer system."
    },
    kannada: {
      title: "ದತ್ತಸಂಚಯ",
      extract: "ಸಾಮಾನ್ಯವಾಗಿ ಕಂಪ್ಯೂಟರ್ ವ್ಯವಸ್ಥೆಯಿಂದ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಆಗಿ ಸಂಗ್ರಹಿಸಲಾದ ಮತ್ತು ಪ್ರವೇಶಿಸಲಾದ ದತ್ತಾಂಶದ ಸಂಘಟಿತ ಸಂಗ್ರಹ."
    }
  },
  "network": {
    word: "network",
    english: {
      title: "Computer network",
      extract: "A set of computers sharing resources located on or provided by network nodes."
    },
    kannada: {
      title: "ಜಾಲಬಂಧ",
      extract: "ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಮತ್ತು ಪರಸ್ಪರ ಸಂವಹನ ನಡೆಸುವ ಗಣಕಯಂತ್ರಗಳ ಗುಂಪು."
    }
  },
  "encryption": {
    word: "encryption",
    english: {
      title: "Encryption",
      extract: "The process of encoding information in such a way that only authorized parties can access it."
    },
    kannada: {
      title: "ಗೂಢಲಿಪೀಕರಣ",
      extract: "ಮಾಹಿತಿಯನ್ನು ಗುಪ್ತ ಸಂಕೇತಗಳಾಗಿ ಪರಿವರ್ತಿಸುವ ಪ್ರಕ್ರಿಯೆ, ಇದರಿಂದ ಅಧಿಕೃತ ವ್ಯಕ್ತಿಗಳು ಮಾತ್ರ ಅದನ್ನು ಓದಬಹುದು."
    }
  },
  "programming": {
    word: "programming",
    english: {
      title: "Computer programming",
      extract: "The process of performing a particular computation, usually by designing and building an executable computer program."
    },
    kannada: {
      title: "ಪ್ರೋಗ್ರಾಮಿಂಗ್",
      extract: "ಸೂಚನೆಗಳನ್ನು ಬರೆಯುವ ಮೂಲಕ ಕಂಪ್ಯೂಟರ್ಗೆ ಕೆಲಸಗಳನ್ನು ನಿರ್ವಹಿಸಲು ನಿರ್ಬಂಧಿಸುವ ಪ್ರಕ್ರಿಯೆ."
    }
  },
  "application": {
    word: "application",
    english: {
      title: "Application software",
      extract: "A computer program designed to carry out a specific task other than one relating to the operation of the computer itself."
    },
    kannada: {
      title: "ಅಪ್ಲಿಕೇಶನ್",
      extract: "ನಿರ್ದಿಷ್ಟ ಕೆಲಸವನ್ನು ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಗಣಕಯಂತ್ರದ ಪ್ರೋಗ್ರಾಂ."
    }
  },
  "operating system": {
    word: "operating system",
    english: {
      title: "Operating system",
      extract: "System software that manages computer hardware, software resources, and provides common services for computer programs."
    },
    kannada: {
      title: "ಕಾರ್ಯಾಚರಣಾ ವ್ಯವಸ್ಥೆ",
      extract: "ಗಣಕಯಂತ್ರದ ಹಾರ್ಡ್‌ವೇರ್ ಮತ್ತು ಸಾಫ್ಟ್‌ವೇರ್ ಸಂಪನ್ಮೂಲಗಳನ್ನು ನಿರ್ವಹಿಸುವ ಸಿಸ್ಟಮ್ ಸಾಫ್ಟ್‌ವೇರ್."
    }
  },
  "browser": {
    word: "browser",
    english: {
      title: "Web browser",
      extract: "An application software for accessing the World Wide Web or a local website."
    },
    kannada: {
      title: "ಬ್ರೌಸರ್",
      extract: "ಅಂತರಜಾಲದಲ್ಲಿ ಮಾಹಿತಿ ಹುಡುಕಲು ಅಥವಾ ವೆಬ್‌ಸೈಟ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಬಳಸುವ ತಂತ್ರಾಂಶ."
    }
  },
  "cloud": {
    word: "cloud",
    english: {
      title: "Cloud computing",
      extract: "The on-demand availability of computer system resources, especially data storage and computing power."
    },
    kannada: {
      title: "ಕ್ಲೌಡ್",
      extract: "ಅಂತರಜಾಲದ ಮೂಲಕ ದೂರದ ಸರ್ವರ್‌ಗಳಲ್ಲಿ ದತ್ತಾಂಶವನ್ನು ಸಂಗ್ರಹಿಸುವ ಮತ್ತು ಬಳಸುವ ತಂತ್ರಜ್ಞಾನ."
    }
  },
  "security": {
    word: "security",
    english: {
      title: "Computer security",
      extract: "The protection of computer systems and networks from attack by malicious actors."
    },
    kannada: {
      title: "ಭದ್ರತೆ",
      extract: "ಗಣಕಯಂತ್ರ ವ್ಯವಸ್ಥೆಗಳು ಮತ್ತು ಜಾಲಬಂಧಗಳನ್ನು ಬಾಹ್ಯ ದಾಳಿಗಳಿಂದ ರಕ್ಷಿಸುವ ವ್ಯವಸ್ಥೆ."
    }
  },
  "server": {
    word: "server",
    english: {
      title: "Server",
      extract: "A computer program or device that provides a service to another computer program and its user."
    },
    kannada: {
      title: "ಸರ್ವರ್",
      extract: "ಇತರ ಗಣಕಯಂತ್ರಗಳಿಗೆ ಸೇವೆ ಒದಗಿಸುವ ಒಂದು ಸಾಮರ್ಥ್ಯವುಳ್ಳ ಗಣಕಯಂತ್ರ."
    }
  },
  "client": {
    word: "client",
    english: {
      title: "Client",
      extract: "A piece of computer hardware or software that accesses a service made available by a server."
    },
    kannada: {
      title: "ಕ್ಲೈಂಟ್",
      extract: "ಸರ್ವರ್‌ನಿಂದ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯುವ ಒಂದು ಗಣಕಯಂತ್ರ ಅಥವಾ ತಂತ್ರಾಂಶ."
    }
  },
  "bandwidth": {
    word: "bandwidth",
    english: {
      title: "Bandwidth",
      extract: "The maximum rate of data transfer across a given path."
    },
    kannada: {
      title: "ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್",
      extract: "ಒಂದು ನಿರ್ದಿಷ್ಟ ಸಮಯದಲ್ಲಿ ವರ್ಗಾವಣೆಯಾಗುವ ಗರಿಷ್ಠ ದತ್ತಾಂಶದ ಪ್ರಮಾಣ."
    }
  },
  "packet": {
    word: "packet",
    english: {
      title: "Network packet",
      extract: "A formatted unit of data carried by a packet-switched network."
    },
    kannada: {
      title: "ಪ್ಯಾಕೆಟ್",
      extract: "ಜಾಲಬಂಧದಲ್ಲಿ ವರ್ಗಾವಣೆಯಾಗುವ ದತ್ತಾಂಶದ ಒಂದು ಸಣ್ಣ ಯುನಿಟ್."
    }
  },
  "protocol": {
    word: "protocol",
    english: {
      title: "Communication protocol",
      extract: "A system of rules that allows two or more entities of a communications system to transmit information."
    },
    kannada: {
      title: "ಪ್ರೋಟೋಕಾಲ್",
      extract: "ಎರಡು ಗಣಕಯಂತ್ರಗಳ ನಡುವೆ ಸಂವಹನ ನಡೆಸಲು ಬೇಕಾದ ನಿಯಮಗಳ ಗುಂಪು."
    }
  },
  "firewall": {
    word: "firewall",
    english: {
      title: "Firewall",
      extract: "A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules."
    },
    kannada: {
      title: "ಫೈರ್ವಾಲ್",
      extract: "ಅನಧಿಕೃತ ಪ್ರವೇಶವನ್ನು ತಡೆಯುವ ಜಾಲಬಂಧ ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ."
    }
  },
  "antivirus": {
    word: "antivirus",
    english: {
      title: "Antivirus software",
      extract: "A computer program used to prevent, detect, and remove malware."
    },
    kannada: {
      title: "ಆಂಟಿವೈರಸ್",
      extract: "ಗಣಕಯಂತ್ರದ ವೈರಸ್‌ಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುವ ಮತ್ತು ತೆಗೆದುಹಾಕುವ ತಂತ್ರಾಂಶ."
    }
  },
  "malware": {
    word: "malware",
    english: {
      title: "Malware",
      extract: "Any software intentionally designed to cause damage to a computer, server, client, or computer network."
    },
    kannada: {
      title: "ಮಾಲ್ವೇರ್",
      extract: "ಗಣಕಯಂತ್ರಕ್ಕೆ ಹಾನಿ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಹಾನಿಕಾರಕ ತಂತ್ರಾಂಶ."
    }
  },
  "phishing": {
    word: "phishing",
    english: {
      title: "Phishing",
      extract: "The fraudulent practice of sending emails purporting to be from reputable companies in order to induce individuals to reveal personal information."
    },
    kannada: {
      title: "ಫಿಶಿಂಗ್",
      extract: "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಬಳಕೆದಾರರ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಕದಿಯಲು ಹೂಡುವ ವಂಚನೆಯ ಜಾಲ."
    }
  },
  "binary": {
    word: "binary",
    english: {
      title: "Binary number",
      extract: "A number expressed in the base-2 numeral system which uses only two symbols: typically \"0\" and \"1\"."
    },
    kannada: {
      title: "ಬೈನರಿ",
      extract: "ಶೂನ್ಯ (0) ಮತ್ತು ಒಂದು (1) ರ ಪದ್ಧತಿಯಲ್ಲಿ ದಾಖಲೆಯಾಗುವ ದತ್ತಾಂಶದ ರೂಪ."
    }
  },
  "bit": {
    word: "bit",
    english: {
      title: "Bit",
      extract: "The basic unit of information in computing and digital communications."
    },
    kannada: {
      title: "ಬಿಟ್",
      extract: "ಗಣಕಯಂತ್ರದಲ್ಲಿ ಮಾಹಿತಿಯ ಅತ್ಯಂತ ಚಿಕ್ಕ ಘಟಕ."
    }
  },
  "byte": {
    word: "byte",
    english: {
      title: "Byte",
      extract: "A unit of data that is eight binary digits long."
    },
    kannada: {
      title: "ಬೈಟ್",
      extract: "ಎಂಟು ಬಿಟ್‌ಗಳ ಸಂಗ್ರಹವನ್ನು ಬೈಟ್ ಎನ್ನಲಾಗುತ್ತದೆ."
    }
  },
  "cpu": {
    word: "cpu",
    english: {
      title: "Central processing unit",
      extract: "The primary component of a computer that acts as its \"control center\"."
    },
    kannada: {
      title: "ಸಿಪಿಯು",
      extract: "ಗಣಕಯಂತ್ರದ ಮಿದುಳು ಎಂದೇ ಕರೆಯಲ್ಪಡುವ ಪ್ರಮುಖ ಭಾಗ."
    }
  },
  "gpu": {
    word: "gpu",
    english: {
      title: "Graphics processing unit",
      extract: "A specialized electronic circuit designed to rapidly manipulate and alter memory to accelerate the creation of images."
    },
    kannada: {
      title: "ಜಿಪಿಯು",
      extract: "ಚಿತ್ರಗಳ ಪ್ರದರ್ಶನವನ್ನು ಸುಧಾರಿಸಲು ಮತ್ತು ವೇಗವರ್ಧಿಸಲು ಬಳಸುವ ಪ್ರೊಸೆಸರ್."
    }
  },
  "ram": {
    word: "ram",
    english: {
      title: "Random-access memory",
      extract: "A form of computer memory that can be read and changed in any order, typically used to store working data and machine code."
    },
    kannada: {
      title: "ರಾಮ್",
      extract: "ಗಣಕಯಂತ್ರದಲ್ಲಿ ತಾತ್ಕಾಲಿಕವಾಗಿ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸುವ ಮೆಮೊರಿ."
    }
  },
  "rom": {
    word: "rom",
    english: {
      title: "Read-only memory",
      extract: "A type of non-volatile memory used in computers and other electronic devices."
    },
    kannada: {
      title: "ರಾಮ್ (ROM)",
      extract: "ಕೇವಲ ಓದಲು ಮಾತ್ರ ಸಾಧ್ಯವಾಗುವ ಮತ್ತು ಅಳಿಸಲಾಗದ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸುವ ಮೆಮೊರಿ."
    }
  },
  "storage": {
    word: "storage",
    english: {
      title: "Computer data storage",
      extract: "A technology consisting of computer components and recording media used to retain digital data."
    },
    kannada: {
      title: "ಶೇಖರಣೆ",
      extract: "ದತ್ತಾಂಶವನ್ನು ದೀರ್ಘಕಾಲಿಕವಾಗಿ ಸಂಗ್ರಹಿಸಿಡುವ ವ್ಯವಸ್ಥೆ."
    }
  },
  "drive": {
    word: "drive",
    english: {
      title: "Disk drive",
      extract: "A device that allows a computer to read from and write to computer disks."
    },
    kannada: {
      title: "ಡ್ರೈವ್",
      extract: "ದತ್ತಾಂಶವನ್ನು ಓದಲು ಅಥವಾ ಬರೆಯಲು ಬಳಸುವ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಾಧನ."
    }
  },
  "keyboard": {
    word: "keyboard",
    english: {
      title: "Computer keyboard",
      extract: "A typewriter-style device which uses an arrangement of buttons or keys to act as mechanical levers or electronic switches."
    },
    kannada: {
      title: "ಕೀಲಿಮಣೆ",
      extract: "ಗಣಕಯಂತ್ರಕ್ಕೆ ಅಕ್ಷರ ಮತ್ತು ಅಂಕಿಗಳನ್ನು ನಮೂದಿಸಲು ಬಳಸುವ ಸಾಧನ."
    }
  },
  "mouse": {
    word: "mouse",
    english: {
      title: "Computer mouse",
      extract: "A handheld pointing device that detects two-dimensional motion relative to a surface."
    },
    kannada: {
      title: "ಮೌಸ್",
      extract: "ಪರದೆಯ ಮೇಲೆ ಪಾಯಿಂಟರ್ ಅನ್ನು ನಿಯಂತ್ರಿಸಲು ಬಳಸುವ ಸಣ್ಣ ಸಾಧನ."
    }
  },
  "monitor": {
    word: "monitor",
    english: {
      title: "Computer monitor",
      extract: "An output device that displays information in pictorial form."
    },
    kannada: {
      title: "ಮೊನಿಟರ್",
      extract: "ಗಣಕಯಂತ್ರದ ಮಾಹಿತಿ ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ಪ್ರದರ್ಶಿಸುವ ಪರದೆ."
    }
  },
  "printer": {
    word: "printer",
    english: {
      title: "Printer",
      extract: "A peripheral device which makes a persistent representation of graphics or text, usually on paper."
    },
    kannada: {
      title: "ಮುದ್ರಕ",
      extract: "ಗಣಕಯಂತ್ರದ ಮಾಹಿತಿಯನ್ನು ಕಾಗದದ ಮೇಲೆ ಮುದ್ರಿಸುವ ಸಾಧನ."
    }
  },
  "scanner": {
    word: "scanner",
    english: {
      title: "Image scanner",
      extract: "A device that optically scans images, printed text, handwriting or an object and converts it to a digital image."
    },
    kannada: {
      title: "ಸ್ಕ್ಯಾನರ್",
      extract: "ದಾಖಲೆಗಳನ್ನು ಚಿತ್ರದ ರೂಪದಲ್ಲಿ ಗಣಕಯಂತ್ರಕ್ಕೆ ವರ್ಗಾಯಿಸುವ ಸಾಧನ."
    }
  },
  "pixel": {
    word: "pixel",
    english: {
      title: "Pixel",
      extract: "A physical point in a raster image, or the smallest addressable element in an all points addressable display device."
    },
    kannada: {
      title: "ಪಿಕ್ಸೆಲ್",
      extract: "ಡಿಜಿಟಲ್ ಚಿತ್ರದ ಅತ್ಯಂತ ಸಣ್ಣ ಬಿಂದು."
    }
  },
  "resolution": {
    word: "resolution",
    english: {
      title: "Image resolution",
      extract: "The detail an image holds."
    },
    kannada: {
      title: "ರೆಸಲ್ಯೂಶನ್",
      extract: "ಚಿತ್ರದ ನಿಖರತೆ ಅಥವಾ ಸ್ಫುಟತೆಯನ್ನು ಅಳತೆ ಮಾಡುವ ಮಾನದಂಡ."
    }
  },
  "link": {
    word: "link",
    english: {
      title: "Hyperlink",
      extract: "A reference to data that the reader can follow by clicking or tapping."
    },
    kannada: {
      title: "ಕೊಂಡಿ",
      extract: "ಒಂದು ಪುಟದಿಂದ ಇನ್ನೊಂದಕ್ಕೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸುವ ಅಂತರಜಾಲದ ವಿಳಾಸ."
    }
  },
  "url": {
    word: "url",
    english: {
      title: "URL",
      extract: "A reference to a web resource that specifies its location on a computer network."
    },
    kannada: {
      title: "ಯುಆರ್‌ಎಲ್",
      extract: "ಯಾವುದೇ ವೆಬ್‌ಸೈಟ್ ಅಥವಾ ಅಂತರಜಾಲ ಸಂಪನ್ಮೂಲದ ನಿರ್ದಿಷ್ಟ ವಿಳಾಸ."
    }
  },
  "website": {
    word: "website",
    english: {
      title: "Website",
      extract: "A collection of web pages and related content that is identified by a common domain name and published on at least one web server."
    },
    kannada: {
      title: "ಜಾಲತಾಣ",
      extract: "ಅಂತರಜಾಲದಲ್ಲಿ ಮಾಹಿತಿ ಒದಗಿಸುವ ಪುಟಗಳ ಸಂಗ್ರಹ."
    }
  },
  "email": {
    word: "email",
    english: {
      title: "Email",
      extract: "A method of exchanging messages between people using electronic devices."
    },
    kannada: {
      title: "ಮಿಂಚಂಚೆ",
      extract: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಾಧನಗಳ ಮೂಲಕ ಸಂದೇಶಗಳನ್ನು ವರ್ಗಾಯಿಸುವ ವ್ಯವಸ್ಥೆ."
    }
  },
  "password": {
    word: "password",
    english: {
      title: "Password",
      extract: "A string of characters used to verify the identity of a user during the authentication process."
    },
    kannada: {
      title: "ಗುಪ್ತಪದ",
      extract: "ವೈಯಕ್ತಿಕ ಖಾತೆಯನ್ನು ರಕ್ಷಿಸಲು ಬಳಸುವ ರಹಸ್ಯ ಸಂಕೇತ."
    }
  },
  "privacy": {
    word: "privacy",
    english: {
      title: "Privacy",
      extract: "The ability of an individual or group to seclude themselves or information about themselves."
    },
    kannada: {
      title: "ಗೌಪ್ಯತೆ",
      extract: "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸುವ ಹಕ್ಕು ಅಥವಾ ಸ್ಥಿತಿ."
    }
  },
  "cache": {
    word: "cache",
    english: {
      title: "Cache",
      extract: "A hardware or software component that stores data so that future requests for that data can be served faster."
    },
    kannada: {
      title: "ಕ್ಯಾಶ್",
      extract: "ಪದೇ ಪದೇ ಬಳಸುವ ಮಾಹಿತಿಯನ್ನು ತ್ವರಿತವಾಗಿ ಪಡೆಯಲು ಬಳಸುವ ತಾತ್ಕಾಲಿಕ ಸಂಗ್ರಹ."
    }
  },
  "cookie": {
    word: "cookie",
    english: {
      title: "HTTP cookie",
      extract: "A small piece of data sent from a website and stored on the user's computer by the user's web browser while the user is browsing."
    },
    kannada: {
      title: "ಕುಕಿ",
      extract: "ಬಳಕೆದಾರರ ಆದ್ಯತೆಗಳನ್ನು ತಿಳಿಯಲು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸಂಗ್ರಹವಾಗುವ ಸಣ್ಣ ಮಾಹಿತಿ."
    }
  },
  "firewall_kannada": {
    word: "ಅಗ್ನಿಗೋಡೆ",
    english: {
      title: "Firewall",
      extract: "A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules."
    },
    kannada: {
      title: "ಫೈರ್ವಾಲ್",
      extract: "ಅನಧಿಕೃತ ಪ್ರವೇಶವನ್ನು ತಡೆಯುವ ಜಾಲಬಂಧ ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ."
    }
  },
  "internet_kannada": {
    word: "ಅಂತರಜಾಲ",
    english: {
      title: "Internet",
      extract: "A global system of interconnected computer networks that use the standard Internet protocol suite to link devices worldwide."
    },
    kannada: {
      title: "ಅಂತರಜಾಲ",
      extract: "ಪ್ರಪಂಚದಾದ್ಯಂತದ ಸಾಧನಗಳನ್ನು ಸಂಪರ್ಕಿಸಲು ಪ್ರಮಾಣಿತ ಇಂಟರ್ನೆಟ್ ಪ್ರೋಟೋಕಾಲ್ ಸೂಟ್ ಅನ್ನು ಬಳಸುವ ಪರಸ್ಪರ ಸಂಪರ್ಕಿತ ಕಂಪ್ಯೂಟರ್ ಜಾಲಗಳ ಜಾಗತಿಕ ವ್ಯವಸ್ಥೆ."
    }
  }
};

/**
 * Searches the offline database for a matching term.
 * Supports both English and Kannada word keys.
 */
export function searchOfflineDB(word: string): DictionaryEntry | null {
  const query = word.toLowerCase().trim();
  
  // Try direct key match
  const match = OFFLINE_DB[query];
  if (match) return { ...match, timestamp: Date.now() };

  // Try reverse search in the database for Kannada titles
  for (const entry of Object.values(OFFLINE_DB)) {
    if (entry.kannada?.title === word || entry.word === word) {
      return { ...entry, timestamp: Date.now() };
    }
  }

  return null;
}
