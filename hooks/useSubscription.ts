'use client';

import { useUser } from "@clerk/nextjs";
import { PLANS, PLAN_LIMITS, PlanType } from "@/lib/subscription-constants";

export const useSubscription = () => {
    const { user, isLoaded } = useUser();

    // While Clerk is loading, return the Free Plan defaults
    if (!isLoaded) {
        return {
            plan: PLANS.FREE,
            limits: PLAN_LIMITS[PLANS.FREE],
            isLoaded: false
        };
    }

    let plan: PlanType = PLANS.FREE;

   
    const metadata = user?.publicMetadata;
    const metadataPlan = (
        metadata?.plan || 
        metadata?.product || 
        metadata?.billingPlan
    )?.toString().toLowerCase();

    if (metadataPlan === 'pro') {
        plan = PLANS.PRO;
    } else if (metadataPlan === 'standard') {
        plan = PLANS.STANDARD;
    }

    return {
        plan,
        limits: PLAN_LIMITS[plan],
        isLoaded: true
    };
};