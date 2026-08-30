import { Opportunity, EvidenceItem, Hypothesis } from '../types';
import { aehmlModelProvider } from '../kernel/model-provider';

export interface RedTeamOutput {
  fatal_assumptions: string[];
  weak_evidence: string[];
  cfo_challenges: string[];
  technical_challenges: string[];
  procurement_challenges: string[];
  legal_challenges: string[];
  delivery_challenges: string[];
  kill_recommendation: boolean;
  confidence: number;
  cheapest_disconfirming_test: string;
  adversarial_summary: string;
}

export const redTeamHolon = {
  id: '11111111-1111-1111-1111-111111111106',
  name: 'Red Team Holon',

  stressTest: async (
    opportunity: Opportunity,
    evidenceList: EvidenceItem[],
    hypotheses: Hypothesis[] = []
  ): Promise<RedTeamOutput> => {
    const response = await aehmlModelProvider.invoke<RedTeamOutput>(
      {
        holonId: redTeamHolon.id,
        task: 'Conduct adversarial stress-test against commercial enthusiasm and uncover fatal failure modes',
        context: { opportunity, evidenceList, hypotheses },
      },
      () => {
        const fatalAssumptions: string[] = [
          'Assumes the economic buyer has sole discretionary authority without requiring board or central procurement sign-off.',
          'Assumes client internal IT staff will cooperate rather than actively defending incumbent manual workflows.',
        ];

        const weakEvidence: string[] = [];
        const unvalidatedItems = evidenceList.filter((e) => e.validation_status === 'unvalidated');
        if (unvalidatedItems.length > 0) {
          weakEvidence.push(
            `${unvalidatedItems.length} evidence items remain unvalidated hearsay or speculation.`
          );
        }

        const cfoChallenges = [
          'What is the verified cash payback period if adoption stalls in month 2?',
          'Will this incur unbudgeted ongoing hosting or hardware upgrade costs?',
        ];

        const technicalChallenges = [
          'Does the legacy system provide stable webhook APIs or require fragile screen-scraping/file polling?',
        ];

        const procurementChallenges = [
          'Are there PRAZ procurement regulations or competitor preferred vendor lists we are unaware of?',
        ];

        const legalChallenges = [
          'Does customer data transmission comply with local data protection and sovereignty acts?',
        ];

        const deliveryChallenges = [
          'What happens if key technical dependencies on the client side take 3 weeks to provision API access?',
        ];

        const killRecommendation = opportunity.opportunity_score < 40;
        const cheapestDisconfirmingTest =
          'Ask the Economic Buyer directly: "If we prove 100% technical feasibility in a 2-day pilot, is budget already allocated to sign within 14 days, or must it go to committee?"';

        return {
          fatal_assumptions: fatalAssumptions,
          weak_evidence: weakEvidence,
          cfo_challenges: cfoChallenges,
          technical_challenges: technicalChallenges,
          procurement_challenges: procurementChallenges,
          legal_challenges: legalChallenges,
          delivery_challenges: deliveryChallenges,
          kill_recommendation: killRecommendation,
          confidence: 0.82,
          cheapest_disconfirming_test: cheapestDisconfirmingTest,
          adversarial_summary: `Identified ${fatalAssumptions.length} critical assumptions and ${technicalChallenges.length + cfoChallenges.length} stakeholder challenges. Cheapest test: ${cheapestDisconfirmingTest}`,
        };
      }
    );

    return response.output;
  },
};
