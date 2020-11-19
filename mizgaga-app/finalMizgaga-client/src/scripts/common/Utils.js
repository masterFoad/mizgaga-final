export const Utils = {

    // K_Nearest_neighbours
    KNN: (() => {
        const distanceVector = (v1, v2) => {
            const dx = v1[0] - v2.x;
            const dy = v1[1] - v2.y;
            const dz = v1[2] - v2.z;

            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };

        const distanceVectorNoSqrt = (v1, v2) => {
            const dx = v1[0] - v2.x;
            const dy = v1[1] - v2.y;
            const dz = v1[2] - v2.z;

            return dx * dx + dy * dy + dz * dz;
        };

        const generateDistanceMap = (data, point, k) => {
            const map = [];
            let maxDistanceInMap;
            for (let index = 0, len = data.length; index < len; index++) {
                const otherPoint = data[index];
                const thisDistance = distanceVector(point, otherPoint);
                /**

                 * Keep at most k items in the map.

                 * Much more efficient for large sets, because this

                 * avoids storing and then sorting a million-item map.

                 * This adds many more sort operations, but hopefully k is small.

                 */
                if (!maxDistanceInMap || thisDistance <= maxDistanceInMap || map.length <= k) {
                    // Only add an item if it's closer than the farthest of the candidates
                    map.push({
                                 index,
                                 distance: thisDistance
                             });
                    // Sort the map so the closest is first
                    map.sort((a, b) => a.distance - b.distance);
                    // If the map became too long, drop the farthest item
                    if (map.length > k) {
                        map.pop();
                    }
                    // Update this value for the next comparison
                    maxDistanceInMap = map[map.length - 1].distance;
                }
            }

            return map;
        };

        return {
            generateDistanceMap: generateDistanceMap
        };
    })(),

    STATS: (() => {
        function standardDeviation(values) {
            const avg = average(values);

            const squareDiffs = values.map(function (value) {
                let diff = value - avg;
                let sqrDiff = diff * diff;
                return sqrDiff;
            });

            const avgSquareDiff = average(squareDiffs);

            const stdDev = Math.sqrt(avgSquareDiff);
            return stdDev;
        }

        function average(data) {
            const sum = data.reduce(function (sum, value) {
                return sum + value;
            }, 0);

            const avg = sum / data.length;
            return avg;
        }

        function radians_to_degrees(radians) {
            const pi = Math.PI;
            return radians * (180 / pi);
        }

        return {
            standardDeviation: standardDeviation,
            radians_to_degrees: radians_to_degrees
        };
    })(),

    compose: (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args)
};




