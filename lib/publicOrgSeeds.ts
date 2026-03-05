export type PublicOrgSeed = {
  orgName: string;
  agencyName: string;
  segment: "Federal Civilian" | "Defense/Military" | "Intelligence Support";
  website: string;
  phone: string;
  headcount: number;
};

export const publicOrgSeeds: PublicOrgSeed[] = [
  {
    orgName: "Department of the Army",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.army.mil",
    phone: "(703) 545-6700",
    headcount: 452000
  },
  {
    orgName: "Department of the Navy",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.navy.mil",
    phone: "(703) 697-5342",
    headcount: 340000
  },
  {
    orgName: "Department of the Air Force",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.af.mil",
    phone: "(703) 695-0640",
    headcount: 325000
  },
  {
    orgName: "U.S. Space Force",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.spaceforce.mil",
    phone: "(703) 545-6700",
    headcount: 14000
  },
  {
    orgName: "Defense Logistics Agency",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.dla.mil",
    phone: "(703) 767-6200",
    headcount: 25000
  },
  {
    orgName: "National Security Agency",
    agencyName: "U.S. Department of Defense",
    segment: "Intelligence Support",
    website: "https://www.nsa.gov",
    phone: "(301) 688-6311",
    headcount: 32000
  },
  {
    orgName: "Defense Information Systems Agency",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.disa.mil",
    phone: "(301) 225-6000",
    headcount: 17000
  },
  {
    orgName: "Defense Health Agency",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.health.mil",
    phone: "(703) 681-6500",
    headcount: 18000
  },
  {
    orgName: "Department of Veterans Affairs",
    agencyName: "U.S. Department of Veterans Affairs",
    segment: "Federal Civilian",
    website: "https://www.va.gov",
    phone: "(800) 827-1000",
    headcount: 470000
  },
  {
    orgName: "Veterans Health Administration",
    agencyName: "U.S. Department of Veterans Affairs",
    segment: "Federal Civilian",
    website: "https://www.va.gov/health",
    phone: "(877) 222-8387",
    headcount: 350000
  },
  {
    orgName: "Department of Homeland Security",
    agencyName: "U.S. Department of Homeland Security",
    segment: "Federal Civilian",
    website: "https://www.dhs.gov",
    phone: "(202) 282-8000",
    headcount: 260000
  },
  {
    orgName: "U.S. Customs and Border Protection",
    agencyName: "U.S. Department of Homeland Security",
    segment: "Federal Civilian",
    website: "https://www.cbp.gov",
    phone: "(202) 325-8000",
    headcount: 65000
  },
  {
    orgName: "Transportation Security Administration",
    agencyName: "U.S. Department of Homeland Security",
    segment: "Federal Civilian",
    website: "https://www.tsa.gov",
    phone: "(866) 289-9673",
    headcount: 56000
  },
  {
    orgName: "Federal Emergency Management Agency",
    agencyName: "U.S. Department of Homeland Security",
    segment: "Federal Civilian",
    website: "https://www.fema.gov",
    phone: "(800) 621-3362",
    headcount: 22000
  },
  {
    orgName: "Department of Justice",
    agencyName: "U.S. Department of Justice",
    segment: "Federal Civilian",
    website: "https://www.justice.gov",
    phone: "(202) 514-2000",
    headcount: 115000
  },
  {
    orgName: "Federal Bureau of Investigation",
    agencyName: "U.S. Department of Justice",
    segment: "Intelligence Support",
    website: "https://www.fbi.gov",
    phone: "(202) 324-3000",
    headcount: 38000
  },
  {
    orgName: "Drug Enforcement Administration",
    agencyName: "U.S. Department of Justice",
    segment: "Federal Civilian",
    website: "https://www.dea.gov",
    phone: "(202) 307-1000",
    headcount: 10000
  },
  {
    orgName: "Department of Energy",
    agencyName: "U.S. Department of Energy",
    segment: "Federal Civilian",
    website: "https://www.energy.gov",
    phone: "(202) 586-5000",
    headcount: 14000
  },
  {
    orgName: "National Nuclear Security Administration",
    agencyName: "U.S. Department of Energy",
    segment: "Intelligence Support",
    website: "https://www.energy.gov/nnsa",
    phone: "(202) 586-2179",
    headcount: 65000
  },
  {
    orgName: "Department of State",
    agencyName: "U.S. Department of State",
    segment: "Federal Civilian",
    website: "https://www.state.gov",
    phone: "(202) 647-4000",
    headcount: 77000
  },
  {
    orgName: "Department of the Treasury",
    agencyName: "U.S. Department of the Treasury",
    segment: "Federal Civilian",
    website: "https://home.treasury.gov",
    phone: "(202) 622-2000",
    headcount: 92000
  },
  {
    orgName: "Internal Revenue Service",
    agencyName: "U.S. Department of the Treasury",
    segment: "Federal Civilian",
    website: "https://www.irs.gov",
    phone: "(800) 829-1040",
    headcount: 80000
  },
  {
    orgName: "Department of Commerce",
    agencyName: "U.S. Department of Commerce",
    segment: "Federal Civilian",
    website: "https://www.commerce.gov",
    phone: "(202) 482-2000",
    headcount: 47000
  },
  {
    orgName: "National Oceanic and Atmospheric Administration",
    agencyName: "U.S. Department of Commerce",
    segment: "Federal Civilian",
    website: "https://www.noaa.gov",
    phone: "(202) 482-6090",
    headcount: 12500
  },
  {
    orgName: "Department of Transportation",
    agencyName: "U.S. Department of Transportation",
    segment: "Federal Civilian",
    website: "https://www.transportation.gov",
    phone: "(202) 366-4000",
    headcount: 56000
  },
  {
    orgName: "Federal Aviation Administration",
    agencyName: "U.S. Department of Transportation",
    segment: "Federal Civilian",
    website: "https://www.faa.gov",
    phone: "(866) 835-5322",
    headcount: 45000
  },
  {
    orgName: "Department of Health and Human Services",
    agencyName: "U.S. Department of Health and Human Services",
    segment: "Federal Civilian",
    website: "https://www.hhs.gov",
    phone: "(877) 696-6775",
    headcount: 93000
  },
  {
    orgName: "Centers for Medicare & Medicaid Services",
    agencyName: "U.S. Department of Health and Human Services",
    segment: "Federal Civilian",
    website: "https://www.cms.gov",
    phone: "(877) 267-2323",
    headcount: 7000
  },
  {
    orgName: "Department of the Interior",
    agencyName: "U.S. Department of the Interior",
    segment: "Federal Civilian",
    website: "https://www.doi.gov",
    phone: "(202) 208-3100",
    headcount: 70000
  },
  {
    orgName: "General Services Administration",
    agencyName: "U.S. General Services Administration",
    segment: "Federal Civilian",
    website: "https://www.gsa.gov",
    phone: "(866) 606-8220",
    headcount: 12000
  },
  {
    orgName: "Office of Personnel Management",
    agencyName: "U.S. Office of Personnel Management",
    segment: "Federal Civilian",
    website: "https://www.opm.gov",
    phone: "(202) 606-1800",
    headcount: 7500
  },
  {
    orgName: "National Aeronautics and Space Administration",
    agencyName: "NASA",
    segment: "Federal Civilian",
    website: "https://www.nasa.gov",
    phone: "(202) 358-0001",
    headcount: 18000
  },
  {
    orgName: "U.S. Coast Guard",
    agencyName: "U.S. Department of Homeland Security",
    segment: "Defense/Military",
    website: "https://www.uscg.mil",
    phone: "(202) 267-1070",
    headcount: 55000
  },
  {
    orgName: "U.S. Cyber Command",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.cybercom.mil",
    phone: "(301) 688-6524",
    headcount: 6000
  },
  {
    orgName: "Defense Counterintelligence and Security Agency",
    agencyName: "U.S. Department of Defense",
    segment: "Intelligence Support",
    website: "https://www.dcsa.mil",
    phone: "(724) 794-5612",
    headcount: 12000
  },
  {
    orgName: "National Geospatial-Intelligence Agency",
    agencyName: "U.S. Department of Defense",
    segment: "Intelligence Support",
    website: "https://www.nga.mil",
    phone: "(571) 557-5400",
    headcount: 14500
  },
  {
    orgName: "Defense Advanced Research Projects Agency",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.darpa.mil",
    phone: "(703) 526-6630",
    headcount: 2200
  },
  {
    orgName: "U.S. Indo-Pacific Command",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.pacom.mil",
    phone: "(808) 477-3000",
    headcount: 12000
  },
  {
    orgName: "U.S. European Command",
    agencyName: "U.S. Department of Defense",
    segment: "Defense/Military",
    website: "https://www.eucom.mil",
    phone: "+49-711-680-0",
    headcount: 8000
  }
];
