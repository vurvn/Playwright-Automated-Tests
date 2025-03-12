import {test, expect} from '@playwright/test';

test.describe('ReqRes API Tests', () => {
    test('LOGIN - SUCCESSFUL', async ({request}) => {
        const response = await request.post('https://reqres.in/api/login', {
            data: {email: 'eve.holt@reqres.in', password: 'cityslicka'},
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Validate token exists and is a string
        expect(responseBody).toHaveProperty('token');
        expect(typeof responseBody.token).toBe('string');
    });

    test('LOGIN - UNSUCCESSFUL', async ({request}) => {
        const response = await request.post('https://reqres.in/api/login', {
            data: {email: 'peter@klaven'},
        });

        expect(response.status()).toBe(400);
        const responseBody = await response.json();

        // Validate error message
        expect(responseBody).toHaveProperty('error', 'Missing password');
    });

    test('DELAYED RESPONSE', async ({request}) => {
        const startTime = Date.now();
        const response = await request.get(
            'https://reqres.in/api/users?delay=3'
        );
        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;

        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Validate response delay
        expect(responseTime).toBeGreaterThanOrEqual(3);

        // Validate user data exists and has correct structure
        expect(responseBody).toHaveProperty('data');
        expect(Array.isArray(responseBody.data)).toBe(true);
        expect(responseBody.data.length).toBeGreaterThan(0);
    });
});
