/**
 * Helper to map a user's trust score to their maximum total borrowing exposure.
 * 
 * trustScore >= 80 -> ₹25,000
 * trustScore >= 60 -> ₹10,000
 * trustScore >= 40 -> ₹3,000
 * else -> ₹1,000
 */
function getCreditLimit(trustScore) {
    if (trustScore >= 80) return 25000;
    if (trustScore >= 60) return 10000;
    if (trustScore >= 40) return 3000;
    return 1000;
}

module.exports = { getCreditLimit };
