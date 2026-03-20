import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";

// 🔐 Clerk
import { useUser } from "@clerk/clerk-react";

// 🔥 Firestore (credits only — auth is handled by Clerk now)
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Pages
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import NotFound from "@/pages/not-found";
import BuyCredits from "@/pages/buy-credits";
import PaymentSuccess from "@/pages/payment-success";
import Contact from "@/pages/contact";

const queryClient = new QueryClient();

function Router() {
  const { user, isSignedIn } = useUser();
  const [credits, setCredits] = useState<number>(0);

  // Sync credits from Firestore when user signs in
  useEffect(() => {
    if (!isSignedIn || !user) {
      setCredits(0);
      return;
    }

    const syncCredits = async () => {
      const ref = doc(db, "users", user.id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setCredits(snap.data().credits ?? 0);
      } else {
        // First time user — create their doc with 0 credits
        await setDoc(ref, {
          email: user.primaryEmailAddress?.emailAddress ?? "",
          name: user.fullName ?? "",
          credits: 0,
          createdAt: new Date().toISOString(),
        });
        setCredits(0);
      }
    };

    syncCredits();
  }, [isSignedIn, user?.id]);

  return (
    <Layout credits={credits}>
      <Switch>
        <Route path="/">
          {() => <Home credits={credits} />}
        </Route>
        <Route path="/explore" component={Explore} />
        <Route path="/contact" component={Contact} />
        <Route path="/buy-credits">
          {() => <BuyCredits />}
        </Route>
        <Route path="/payment-success">
          {() => <PaymentSuccess />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
