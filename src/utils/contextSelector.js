/**
 * Smart Context Selection Algorithm
 * Selects the most relevant 3-4 contexts based on:
 * 1. Value magnitude (prefer counts between 0.5 and 10)
 * 2. Cultural priority (items marked with priority: true)
 * 3. Practical range expansion if needed
 */

export const selectRelevantContexts = (contexts, maxContexts = 4) => {
    // Calculate count for each context
    const contextsWithCounts = contexts.map(ctx => ({
        ...ctx,
        score: calculateRelevanceScore(ctx.count, ctx.priority)
    }));

    // Sort by score (higher is better)
    const sorted = contextsWithCounts.sort((a, b) => b.score - a.score);

    // Return top N contexts
    return sorted.slice(0, maxContexts);
};

const calculateRelevanceScore = (count, isPriority = false) => {
    let score = 0;

    // Ideal range: 0.5 to 10 (highest score)
    if (count >= 0.5 && count <= 10) {
        score = 100;
        // Bonus for counts closer to 1-5 (most readable)
        if (count >= 1 && count <= 5) {
            score += 20;
        }
    }
    // Acceptable range: 0.1 to 50
    else if (count >= 0.1 && count <= 50) {
        score = 50;
    }
    // Outside acceptable range
    else if (count >= 0.01 && count <= 100) {
        score = 20;
    }
    // Very poor fit
    else {
        score = 1;
    }

    // Priority items get a significant boost
    if (isPriority) {
        score += 30;
    }

    return score;
};
