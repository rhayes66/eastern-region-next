/** The GERAF constitution, section by section (from the legacy site). */
export type ConstitutionSection = {
  id: string;
  title: string;
  intro?: string;
  items?: string[];
  paragraphs?: string[];
};

export const CONSTITUTION: ConstitutionSection[] = [
  {
    id: "aims",
    title: "Aims",
    intro: "The aims of the association are:",
    items: [
      "To establish a standing fund through monthly contributions of all the association members who are interested in the aim.",
      "To help and support members who contribute to the fund in times of emergency and extreme need, as outlined in the basic rules.",
      "Promoting education and health, and helping school facilities in the Eastern Region of Ghana.",
      "To raise funds, by lawful means of accepting gifts, donations or otherwise, for the association.",
    ],
  },
  {
    id: "objectives",
    title: "Objectives",
    intro: "The objectives of the association are:",
    items: [
      "Raise funds and receive contributions, where appropriate, to finance the work of the association.",
      "Open bank accounts.",
      "Make rules and standing orders for categories of members and their rights.",
      "Organize meetings and events, work with the Ghana Union and exchange information with them.",
      "Take any lawful action that would help it fulfil its aims.",
    ],
  },
  {
    id: "membership",
    title: "Membership",
    items: [
      "Any Ghanaian or non-Ghanaian resident in Finland who is 18 years or older may become a member of the association.",
      "The board committee may refuse membership to an applicant where it considers that such membership would be detrimental to the aims, purposes or activities of the association.",
      "Membership is open to individuals irrespective of political party, nationality, religion or political opinion.",
      "All members shall be registered by filling in an application form with a registration fee of €50, with the application approved by the Board of Committee.",
      "Any member may resign by giving written notice to the secretary. Membership may be terminated or suspended by resolution of the Board of Committee if a member's conduct is prejudicial to the association, provided the member has the right to be heard first, with a right of appeal to an independent arbitrator.",
    ],
  },
  {
    id: "board",
    title: "Board of Committee",
    intro: "The association is governed by a Board of Committee, consisting of:",
    items: [
      "Chairman / Chairperson",
      "Vice Chairman / Chairperson",
      "Secretary",
      "Vice Secretary",
      "Financial Secretary",
      "A Treasurer",
      "2 Organizing Secretaries and 2 Supporting Organizers",
      "2 Porters (1 male and 1 female)",
    ],
    paragraphs: [
      "The Board of Committee shall meet at least three times a year, and is responsible for administering the association's fund in accordance with the bylaws.",
      "At least five Board Committee members must be present for a board meeting to take place. Voting is by ballot on a majority basis; in a tied vote the chairperson has a second vote.",
    ],
  },
  {
    id: "contributions",
    title: "Contributions",
    items: [
      "Each member contributes €10 per month, amounting to €120 a year, which may also be paid in full at once.",
      "Members are reminded by March if they have not paid at least €60 of their contribution.",
      "Any member who has not paid in full by the end of March becomes a defaulter, and after three months of defaulting may be expelled and ceases to benefit from the fund.",
    ],
  },
  {
    id: "calendar",
    title: "Calendar Year",
    paragraphs: [
      "The calendar year of the association runs from 1 January to 31 December each year.",
      "The main financial report is given at the first meeting after the previous year ends (for example, the last Saturday of January), with a half-year mini report in between.",
    ],
  },
  {
    id: "benefits",
    title: "Benefits",
    intro:
      "Each non-defaulting member is eligible for assistance from the fund, qualifying from six months after joining. A non-defaulting member receives assistance in the following circumstances:",
    items: [
      "Death of a close relative (mother, father, spouse, child): €500, plus each member contributes a minimum of €20 to assist. If a couple are both non-defaulting members and their child passes away, each receives €500.",
      "Passing away of a non-defaulting member: the family receives €1000 from the fund. If a couple are both members and one passes away, the surviving spouse receives €500 (membership) plus €1000 (family benefit).",
      "If a defaulting member becomes a victim of circumstances needing help, contributions are made by members, with remaining dues deducted before the rest is given.",
      "New-born baby: a non-defaulting member receives a minimum of €50; if both parents are members, a minimum of €100.",
      "Major health issues (e.g. deformity, operation): a non-defaulting member receives €100 plus members' voluntary contributions.",
    ],
  },
  {
    id: "benefits-new-members",
    title: "Benefits for New Members",
    paragraphs: [
      "1. Partial Benefit Entitlement",
      "1.1. A new member shall be eligible for partial benefits proportional to the total monthly contributions made from the date of joining up to the time of need.",
      "1.2. The calculated contribution amount shall be subject to a deduction of twenty percent (20%).",
      "1.3. In addition, the member shall be entitled to receive the standard voluntary contribution of €50, together with any other voluntary contributions made by members of the Association.",
      "Illustration: A member who joins in January 2026 and encounters a qualifying need in September 2026 shall have contributed for nine (9) months. At a monthly contribution of €10, the total contribution equals €90. After a 20% deduction (€18), the payable amount shall be €72, excluding voluntary contributions.",
      "2. Full Benefit Entitlement",
      "2.1. A new member shall become eligible for full benefits only upon completion of five (5) consecutive years of active membership.",
      "2.2. Eligibility for full benefits shall be conditional upon the member having no outstanding debts or financial obligations to the Association.",
    ],
  },
  {
    id: "benefits-rejoining-members",
    title: "Benefits for Rejoining Members",
    paragraphs: [
      "1. Definition",
      "1.1. A Rejoining Member refers to a former member who returns to the Association after a period of inactivity or withdrawal.",
      "2. Registration Fee Waiver",
      "2.1. Rejoining Members shall be exempt from payment of the standard registration fee of €50.",
      "3. Eligibility for Benefits",
      "3.1. Rejoining Members shall be entitled to benefits under the same terms and conditions applicable to new members, as set out in the relevant provisions governing New Members.",
      "4. Settlement of Outstanding Obligations",
      "4.1. A Rejoining Member with outstanding debts may apply to the Association for an approved payment plan to settle such obligations.",
      "4.2. A Rejoining Member who fully settles all outstanding debts shall become eligible for full benefits, subject to all other applicable conditions of the Association.",
      "4.3. A Rejoining Member who is actively complying with an approved payment plan may access benefits in accordance with the rules applicable to new members until all debts are fully settled.",
    ],
  },
  {
    id: "fundraising",
    title: "Fund-raising Activities",
    items: [
      "World Village Festival (Helsinki)",
      "Restaurant Day",
      "Helsinki Day",
      "Monthly dues",
      "Registration fees",
    ],
  },
  {
    id: "amendments",
    title: "Amendments of the Constitution",
    paragraphs: [
      "Proposals for amendments, or dissolution, must be delivered to the secretary in writing. A forum meeting is then called with at least four weeks (28 days) clear notice.",
      "Any changes must be agreed by at least two thirds of members present and voting at a general meeting.",
    ],
  },
  {
    id: "resignation",
    title: "Resignation",
    paragraphs: [
      "A member may voluntarily terminate membership by giving written notice to the secretary, and thereupon ceases to be a member but remains liable for any subscription due at the time. Notice should be four weeks. If the resigning member holds a position, all association documents must be handed over to the secretary.",
    ],
  },
  {
    id: "dissolution",
    title: "Dissolution of the Association",
    paragraphs: [
      "The association may be wound up if agreed by two thirds of members present and voting at a general meeting. Any assets are returned to their providers if required, or passed to another group with similar aims.",
    ],
  },
];
