import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProfitMonitor {
    /**
     * Mock data for project profitability (Earnings USD per hour/unit).
     */
    static async getProjectPerformance() {
        return [
            { name: 'Grass', profitScore: 0.15 + Math.random() * 0.05 },
            { name: 'Dawn', profitScore: 0.12 + Math.random() * 0.08 },
            { name: 'BNB Edge', profitScore: 0.20 + Math.random() * 0.10 },
        ];
    }

    /**
     * Analyzes all active profiles and suggests/triggers a switch if a more profitable project is found.
     */
    static async optimizeAllProfiles() {
        const performances = await this.getProjectPerformance();
        const sortedProjects = [...performances].sort((a, b) => b.profitScore - a.profitScore);
        const bestProject = sortedProjects[0];

        console.log(`[ProfitMonitor] Current best project: ${bestProject.name} (Score: ${bestProject.profitScore.toFixed(4)})`);

        const profiles = await prisma.farmProfile.findMany({
            where: { status: 'active' }
        });

        for (const profile of profiles) {
            // Logic to update profile's running project could go here
            // For simulation, we'll just log it
            console.log(`[ProfitMonitor] Optimizing profile ${profile.name} -> Switched to ${bestProject.name}`);
        }

        return bestProject;
    }
}
