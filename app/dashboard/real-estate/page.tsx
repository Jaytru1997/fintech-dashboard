"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userApi } from "@/lib/api/endpoints";
import { RealEstate, RealEstateInvestment } from "@/lib/types";
import { toast } from "react-toastify";
import { Building2 } from "lucide-react";
import Image from "next/image";

export default function RealEstatePage() {
  const [properties, setProperties] = useState<RealEstate[]>([]);
  const [investments, setInvestments] = useState<RealEstateInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<RealEstate | null>(null);
  const [amount, setAmount] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [propertiesData, investmentsData] = await Promise.all([
        userApi.getRealEstate(),
        userApi.getRealEstateInvestments(),
      ]);
      setProperties(propertiesData);
      setInvestments(investmentsData);
    } catch (error) {
      toast.error("Failed to load real estate data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!selectedProperty || !amount || !durationMonths) return;
    setIsSubmitting(true);
    try {
      await userApi.investRealEstate({
        realEstateId: selectedProperty._id,
        amount: parseFloat(amount),
        durationMonths: parseInt(durationMonths),
      });
      toast.success("Investment successful!");
      setSelectedProperty(null);
      setAmount("");
      setDurationMonths("");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Investment failed");
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-3xl font-bold text-white">Real Estate</h1>
        <p className="text-gray-400 mt-2">
          Invest in real estate portfolios and earn passive income
        </p>
      </div>

      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Available Properties</TabsTrigger>
          <TabsTrigger value="investments">My Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {property.title}
                  </CardTitle>
                  <CardDescription>
                    ROI: {property.roi}% | Min Investment: ${property.minimumInvestment}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {property.overview}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedProperty(property)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{property.title}</DialogTitle>
                        <DialogDescription>
                          ROI: {property.roi}% | Min Investment: ${property.minimumInvestment}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative h-64 w-full rounded-lg overflow-hidden">
                          <Image
                            src={property.image}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">Strategy</h3>
                          <p className="text-sm text-muted-foreground">{property.strategy}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">Overview</h3>
                          <p className="text-sm text-muted-foreground">{property.overview}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">Project Breakdown</h3>
                          <p className="text-sm text-muted-foreground">{property.projectBreakdown}</p>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Investment Amount</Label>
                            <Input
                              id="amount"
                              type="number"
                              min={property.minimumInvestment}
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="Enter amount"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (months)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="1"
                              value={durationMonths}
                              onChange={(e) => setDurationMonths(e.target.value)}
                              placeholder="Enter duration"
                            />
                          </div>
                          <div className="p-4 bg-background-dark rounded-lg">
                            <p className="text-sm text-gray-400">Expected Return:</p>
                            <p className="text-2xl font-bold text-white">
                              ${amount && durationMonths
                                ? (parseFloat(amount) * (1 + property.roi / 100) * (parseInt(durationMonths) / 12)).toFixed(2)
                                : "0.00"}
                            </p>
                          </div>
                          <Button
                            onClick={handleInvest}
                            disabled={isSubmitting || !amount || !durationMonths || parseFloat(amount) < property.minimumInvestment}
                            className="w-full"
                          >
                            {isSubmitting ? "Processing..." : "Invest Now"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {properties.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No real estate properties available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No investments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    investments.map((investment) => (
                      <TableRow key={investment._id}>
                        <TableCell>{investment.realEstateTitle || "N/A"}</TableCell>
                        <TableCell>${investment.amount.toLocaleString()}</TableCell>
                        <TableCell>{investment.durationMonths} months</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              investment.status === "active"
                                ? "bg-primary/20 text-primary"
                                : "bg-background-dark text-gray-400"
                            }`}
                          >
                            {investment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(investment.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

