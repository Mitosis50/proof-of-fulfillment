import { PUBLIC_EXAMPLE_RECEIPT_ID } from "./golden.ts";
import { PRODUCT_NAMES } from "./naming.ts";

export const HUMAN_CHECK = {
  minutes: 20,
  pay: "$75–$100",
  people: 5,
  tagline: PRODUCT_NAMES.tagline,
  example_id: PUBLIC_EXAMPLE_RECEIPT_ID,
  who: "Five people who did not build this. Mix is better than experts: someone who pays tuition, someone who rents, a teacher if you have one, a skeptic, and someone who has never heard of this.",
  do_not: [
    "Do not put a real name, email, student, patient, or tenant into the workshop.",
    "Do not ask them to create an account.",
    "Do not tell them what they are supposed to see before they look.",
  ],
  tasks: [
    {
      n: 1,
      title: "The card",
      path: "/share",
      ask: "What does this page say, in your own words? Is there a person’s name?",
    },
    {
      n: 2,
      title: "Independent check",
      path: `/verify?example=${PUBLIC_EXAMPLE_RECEIPT_ID}`,
      ask: "Does it say Holds or Does not hold? What do you think that means?",
    },
    {
      n: 3,
      title: "What it will not say",
      path: `/refusal/${PUBLIC_EXAMPLE_RECEIPT_ID}`,
      ask: "Can you find a student, a grade, or a diagnosis? List anything that looks like a person.",
    },
    {
      n: 4,
      title: "Paper",
      path: `/paper/${PUBLIC_EXAMPLE_RECEIPT_ID}`,
      ask: "Print or Save as PDF if you can. Can you read the digest? If you have a phone, scan the QR. Where does it go?",
    },
    {
      n: 5,
      title: "Whitepaper, one minute",
      path: "/whitepaper",
      ask: "Does this sound like a live school service, or a prototype? Would you send this to someone with a real child in school? Why or why not?",
    },
  ],
} as const;

export function humanCheckMarkdown(): string {
  const tasks = HUMAN_CHECK.tasks
    .map(
      (t) =>
        `### ${t.n}. ${t.title}\n\nOpen: ${t.path}\n\n${t.ask}`,
    )
    .join("\n\n");
  return `# Independent human check

${HUMAN_CHECK.tagline}

Five people. About ${HUMAN_CHECK.minutes} minutes each. Pay ${HUMAN_CHECK.pay} per person, from you, not from a verdict. This explorer is synthetic. It is not a production authority.

## Who

${HUMAN_CHECK.who}

They must not have issued a receipt in the workshop. The builder is not independent.

## Do not

${HUMAN_CHECK.do_not.map((d) => `- ${d}`).join("\n")}

## Tasks

Send them this page or the live site paths below. Do not coach.

${tasks}

## What to write down

For each person, only this:

- Task number
- What they said they saw
- Whether they found a person (yes/no)
- Whether they thought “Verified” meant a student passed (yes/no)
- Whether they would send this about a real child (yes/no, and why)

No names of testers on the explorer. Keep their notes off the ledger.

## How you decide

If three of five say they saw a person, or they think Verified means the student passed, this is not ready.

If they see Holds, they do not find a person, and they understand it is a prototype, the human check holds.
`;
}
