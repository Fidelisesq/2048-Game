const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    try {
        // Handle both API Gateway v1 and v2 formats
        const httpMethod = event.httpMethod || event.requestContext?.http?.method;
        const path = event.path || event.rawPath || event.routeKey;
        
        console.log('Event:', JSON.stringify(event, null, 2));
        console.log('Method:', httpMethod, 'Path:', path);

        if (httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers };
        }

        if (httpMethod === 'GET' && (path === '/leaderboard' || path?.endsWith('/leaderboard'))) {
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

            const result = await dynamodb.send(new QueryCommand(params));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Items)
            };
        }

        if (httpMethod === 'POST' && (path === '/score' || path?.endsWith('/score'))) {
            // Submit new score
            const requestBody = event.body || '{}';
            const body = JSON.parse(requestBody);
            const { playerName, score } = body;

            console.log('Parsed body:', body);

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
                    id: `$${Date.now()}-$${Math.random()}`,
                    playerName: playerName.toString(),
                    score: parseInt(score),
                    game_type: 'classic',
                    timestamp: new Date().toISOString()
                }
            };

            console.log('DynamoDB params:', params);
            await dynamodb.send(new PutCommand(params));
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