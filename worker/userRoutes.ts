import { Hono } from "hono";
import { Env } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Add more routes like this. **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));
    // Pennie / PID Data Proxy
    app.get('/api/pennie-rates', (c) => {
        // In a real scenario, this would fetch from Pennie's public API or PID open data
        // Returning mock PA pricing data for regional benchmarks
        return c.json({
            success: true,
            data: {
                timestamp: new Date().toISOString(),
                source: "PA-PID-MOCK",
                regions: [
                    { name: "Philadelphia", bronze: 420.50, silver: 540.25, gold: 650.00 },
                    { name: "Pittsburgh", bronze: 385.00, silver: 490.50, gold: 595.25 },
                    { name: "Allentown", bronze: 395.00, silver: 510.00, gold: 615.00 },
                    { name: "Erie", bronze: 365.00, silver: 470.00, gold: 570.00 }
                ],
                national_average_hike: 0.065,
                pa_average_hike: 0.074
            }
        });
    });
}