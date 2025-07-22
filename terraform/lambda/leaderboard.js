const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    try {
        const { httpMethod, path, rawPath, routeKey } = event;
        const actualPath = rawPath || path || routeKey;
        
        console.log('Event:', JSON.stringify(event, null, 2));
        console.log('Method:', httpMethod, 'Path:', actualPath);

        if (httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers };
        }

        if (httpMethod === 'GET' && (actualPath === '/leaderboard' || actualPath?.endsWith('/leaderboard'))) {
            // Get top 10 scores
            const params = {
                TableName: '2048-leaderboard',
                IndexName: 'ScoreIndex',
                KeyConditionExpression: 'game_type = :gt',
                ExpressionAttributeValues: {
                    ':gt': 'classic'
                },
                ScanIndexForward: false,
                Limit: 10
            };

            const result = await dynamodb.query(params).promise();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Items)
            };
        }

        if (httpMethod === 'POST' && (actualPath === '/score' || actualPath?.endsWith('/score'))) {
            // Submit new score
            const body = JSON.parse(event.body);
            const { playerName, score } = body;

            if (!playerName || !score) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing playerName or score' })
                };
            }

            const params = {
                TableName: '2048-leaderboard',
                Item: {
                    id: Date.now() + '-' + Math.random(),
                    playerName,
                    score: parseInt(score),
                    game_type: 'classic',
                    timestamp: new Date().toISOString()
                }
            };

            await dynamodb.put(params).promise();
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ message: 'Score submitted successfully' })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};