import type { AssessmentOutput } from '@/types';

export function parseAssessmentJSON(rawText: string): AssessmentOutput | null {
    try {
        // Try extracting from <assessment> tags first
        const tagMatch = rawText.match(/<assessment>([\s\S]*?)<\/assessment>/);
        if (tagMatch) {
            const parsed = JSON.parse(tagMatch[1].trim());
            return parsed as AssessmentOutput;
        }

        // Fallback: try extracting a raw JSON block
        const jsonMatch = rawText.match(/\{[\s\S]*"is_complete"[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed as AssessmentOutput;
        }

        return null;
    } catch {
        return null;
    }
}

type DomainScores = {
    sleep_score: number;
    energy_score: number;
    stress_score: number;
    social_score: number;
    wins_score: number;
    worry_score: number;
    coping_score: number;
    intention_score: number;
};

export function calculateTier(scores: DomainScores): 'thriving' | 'managing' | 'struggling' {
    const total =
        scores.sleep_score +
        scores.energy_score +
        scores.stress_score +
        scores.social_score +
        scores.wins_score +
        scores.worry_score +
        scores.coping_score +
        scores.intention_score;

    if (total >= 13) return 'thriving';
    if (total >= 8) return 'managing';
    return 'struggling';
}

// Rule-based fallback scorer using keyword matching
// Used to validate / cross-check AI-generated scores
type RuleScoreResult = {
    scores: DomainScores;
    total: number;
    tier: 'thriving' | 'managing' | 'struggling';
    rec_tags: string[];
    safety_flag: boolean;
};

export function ruleBasedScore(conversationText: string): RuleScoreResult {
    const text = conversationText.toLowerCase();

    // Safety keywords — check first
    const safetyKeywords = [
        'want to die', 'kill myself', 'end my life', 'suicide', 'suicidal',
        "don't want to be here", 'hurt myself', 'self harm', 'everyone would be better off',
        "can't go on", 'no reason to live', "what's the point of living",
    ];
    const safety_flag = safetyKeywords.some((kw) => text.includes(kw));

    // Sleep scoring
    const poorSleep = ['insomnia', "can't sleep", 'no sleep', 'sleep deprived', '3am', '4am',
        'waking up', 'tired', 'exhausted', 'fatigue', 'restless night'];
    const goodSleep = ['slept well', 'good sleep', 'sleeping fine', 'sleep has been okay',
        'well rested', 'rested'];
    const sleep_score = goodSleep.some((kw) => text.includes(kw)) ? 2
        : poorSleep.some((kw) => text.includes(kw)) ? 0 : 1;

    // Energy scoring
    const lowEnergy = ['no energy', 'drained', 'exhausted', 'running on empty', 'burnt out',
        'burnout', 'burned out', 'can barely', 'no motivation'];
    const highEnergy = ['energetic', 'lots of energy', 'feeling good', 'motivated', 'productive'];
    const energy_score = highEnergy.some((kw) => text.includes(kw)) ? 2
        : lowEnergy.some((kw) => text.includes(kw)) ? 0 : 1;

    // Stress scoring
    const highStress = ['overwhelmed', 'stressed', 'pressure', 'too much', 'can\'t cope',
        'deadline', 'falling apart', 'breaking point', 'anxious', 'anxiety'];
    const lowStress = ['calm', 'relaxed', 'not much stress', 'doing okay', 'fine'];
    const stress_score = lowStress.some((kw) => text.includes(kw)) ? 2
        : highStress.some((kw) => text.includes(kw)) ? 0 : 1;

    // Social scoring
    const isolated = ['alone', 'lonely', 'isolated', 'no one', 'nobody', 'disconnected',
        'by myself', 'withdrawn', 'avoiding'];
    const connected = ['friends', 'family', 'connected', 'talked to', 'support', 'understood',
        'close to'];
    const social_score = connected.some((kw) => text.includes(kw)) ? 2
        : isolated.some((kw) => text.includes(kw)) ? 0 : 1;

    // Wins scoring
    const noWins = ["nothing", "can't think", "nothing good", "no wins", "nothing went well"];
    const hasWins = ['managed to', 'finished', 'completed', 'good meal', 'enjoyed', 'proud',
        'accomplished', 'went well'];
    const wins_score = hasWins.some((kw) => text.includes(kw)) ? 2
        : noWins.some((kw) => text.includes(kw)) ? 0 : 1;

    // Worry scoring
    const highWorry = ['can\'t stop thinking', 'keeps coming back', 'constant worry',
        'always anxious', 'what if', 'catastroph', 'worst case', 'spiral'];
    const lowWorry = ['not really worried', 'pretty okay', 'not much on my mind'];
    const worry_score = lowWorry.some((kw) => text.includes(kw)) ? 2
        : highWorry.some((kw) => text.includes(kw)) ? 0 : 1;

    // Coping scoring
    const poorCoping = ['drinking', 'alcohol', 'scrolling', 'nothing works', 'can\'t cope',
        'binge', 'avoiding', 'hiding', 'giving up'];
    const goodCoping = ['exercise', 'gym', 'run', 'journal', 'meditat', 'talk to friends',
        'therapy', 'breathing', 'walk'];
    const coping_score = goodCoping.some((kw) => text.includes(kw)) ? 2
        : poorCoping.some((kw) => text.includes(kw)) ? 0 : 1;

    // Intention scoring — if they gave a specific goal it's positive
    const noIntention = ["don't know", 'no idea', 'nothing', 'i guess just survive'];
    const hasIntention = ['want to', 'hope to', 'would like', 'goal', 'plan', 'focus on',
        'work on', 'better at'];
    const intention_score = hasIntention.some((kw) => text.includes(kw)) ? 2
        : noIntention.some((kw) => text.includes(kw)) ? 0 : 1;

    const scores: DomainScores = {
        sleep_score, energy_score, stress_score, social_score,
        wins_score, worry_score, coping_score, intention_score,
    };

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const tier = calculateTier(scores);

    // rec_tags from rule matching
    const rec_tags: string[] = [];
    if (text.includes('work') || text.includes('job') || text.includes('office')) rec_tags.push('work_stress');
    if (lowEnergy.some((kw) => text.includes(kw))) rec_tags.push('burnout');
    if (highStress.some((kw) => text.includes(kw))) rec_tags.push('anxiety');
    if (poorSleep.some((kw) => text.includes(kw))) rec_tags.push('sleep_issues');
    if (isolated.some((kw) => text.includes(kw))) rec_tags.push('social_isolation');
    if (text.includes('relationship') || text.includes('partner') || text.includes('breakup')) rec_tags.push('relationship_issues');
    if (text.includes('family')) rec_tags.push('family_stress');
    if (text.includes('money') || text.includes('financial') || text.includes('debt')) rec_tags.push('financial_stress');
    if (text.includes('health') || text.includes('illness') || text.includes('sick')) rec_tags.push('health_anxiety');
    if (rec_tags.length === 0) rec_tags.push('general_wellness');

    return { scores, total, tier, rec_tags, safety_flag };
}

export function validateAndMergeScores(
    aiAssessment: AssessmentOutput,
    conversationText: string
): AssessmentOutput {
    const ruleBased = ruleBasedScore(conversationText);

    // Safety flag: either source can trigger it
    const safety_flag = aiAssessment.safety_flag || ruleBased.safety_flag;

    // Cross-check tier — if they diverge by 2+ tiers, flag for review
    const tierOrder = { thriving: 2, managing: 1, struggling: 0 };
    const aiTierVal = tierOrder[aiAssessment.tier];
    const rulesTierVal = tierOrder[ruleBased.tier];
    const tierDivergence = Math.abs(aiTierVal - rulesTierVal);

    // If large divergence, trust the more conservative (lower) score
    const finalTier = tierDivergence >= 2
        ? (aiTierVal < rulesTierVal ? aiAssessment.tier : ruleBased.tier)
        : aiAssessment.tier;

    return {
        ...aiAssessment,
        tier: finalTier,
        safety_flag,
    };
}