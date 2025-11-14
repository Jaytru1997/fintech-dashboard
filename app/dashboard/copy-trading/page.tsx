"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userApi } from "@/lib/api/endpoints";
import { CopyTrader } from "@/lib/types";
import { toast } from "react-toastify";
import { Copy, TrendingUp } from "lucide-react";

export default function CopyTradingPage() {
  const [traders, setTraders] = useState<CopyTrader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTraders();
  }, []);

  const loadTraders = async () => {
    try {
      const data = await userApi.getCopyTraders();
      setTraders(data);
    } catch (error) {
      toast.error("Failed to load copy traders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (traderId: string) => {
    try {
      await userApi.followCopyTrader({ traderId });
      toast.success("Now following trader!");
      loadTraders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to follow trader");
    }
  };

  const handleUnfollow = async (traderId: string) => {
    try {
      await userApi.unfollowCopyTrader({ traderId });
      toast.success("Unfollowed trader");
      loadTraders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to unfollow trader");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Copy Trading</h1>
        <p className="text-muted-foreground mt-2">
          Follow experienced traders and copy their trades automatically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {traders.map((trader) => (
          <Card key={trader._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                {trader.name}
              </CardTitle>
              <CardDescription>{trader.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Performance</span>
                <span className="text-lg font-bold text-primary">
                  {trader.performance > 0 ? "+" : ""}
                  {trader.performance}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`h-4 w-4 ${
                    trader.performance > 0 ? "text-green-500" : "text-error"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {trader.performance > 0 ? "Profitable" : "Loss"}
                </span>
              </div>
              {trader.isFollowing ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUnfollow(trader._id)}
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleFollow(trader._id)}
                >
                  Follow
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {traders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No copy traders available</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

