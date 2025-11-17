"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api/endpoints";
import { RealEstate, CreateRealEstateRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";

export default function AdminRealEstatePage() {
  const [properties, setProperties] = useState<RealEstate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<RealEstate | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateRealEstateRequest>({
    title: "",
    image: "",
    minimumInvestment: 0,
    roi: 0,
    strategy: "",
    overview: "",
    documents: [],
    type: "",
    kind: "",
    objective: "",
    whyThisProject: "",
    whyThisSponsor: "",
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getRealEstate();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'properties' in response && Array.isArray(response.properties)) {
        data = response.properties;
      }
      
      const validProperties = Array.isArray(data)
        ? data.filter((prop): prop is RealEstate => prop != null && typeof prop === 'object' && ('_id' in prop || 'id' in prop))
          .map((prop: any) => {
            if ('id' in prop && !('_id' in prop)) {
              const { id, ...rest } = prop;
              return { ...rest, _id: id } as RealEstate;
            }
            return prop as RealEstate;
          })
        : [];
      setProperties(validProperties);
    } catch (error: any) {
      console.error("Error loading properties:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load real estate properties");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.createRealEstate(formData);
      toast.success("Real estate property created successfully");
      setIsCreateMode(false);
      resetForm();
      loadProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProperty?._id) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateRealEstate(selectedProperty._id, formData);
      toast.success("Property updated successfully");
      setSelectedProperty(null);
      resetForm();
      loadProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      minimumInvestment: 0,
      roi: 0,
      strategy: "",
      overview: "",
      documents: [],
      type: "",
      kind: "",
      objective: "",
      whyThisProject: "",
      whyThisSponsor: "",
    });
  };

  const handleEdit = (property: RealEstate) => {
    setSelectedProperty(property);
    setIsCreateMode(false);
    setFormData({
      title: property?.title || "",
      image: property?.image || "",
      minimumInvestment: property?.minimumInvestment || 0,
      roi: property?.roi || 0,
      strategy: property?.strategy || "",
      overview: property?.overview || "",
      documents: property?.documents || [],
      type: property?.type || "",
      kind: property?.kind || "",
      objective: property?.objective || "",
      whyThisProject: property?.whyThisProject || "",
      whyThisSponsor: property?.whyThisSponsor || "",
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Real Estate</h1>
          <p className="text-gray-400 mt-2">
            Manage real estate investment properties
          </p>
        </div>
        <Dialog open={isCreateMode || selectedProperty !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateMode(false);
            setSelectedProperty(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsCreateMode(true);
              setSelectedProperty(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isCreateMode ? "Create Real Estate Property" : "Edit Property"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Add a new real estate investment property" : "Update property details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Property title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumInvestment">Minimum Investment</Label>
                  <Input
                    id="minimumInvestment"
                    type="number"
                    value={formData.minimumInvestment}
                    onChange={(e) => setFormData({ ...formData, minimumInvestment: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI (%)</Label>
                  <Input
                    id="roi"
                    type="number"
                    value={formData.roi}
                    onChange={(e) => setFormData({ ...formData, roi: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strategy">Strategy</Label>
                <Input
                  id="strategy"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  placeholder="Investment strategy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overview">Overview</Label>
                <textarea
                  id="overview"
                  className="w-full rounded-md border border-gray-800 bg-background px-3 py-2 min-h-[100px]"
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Property overview"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Residential, Commercial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kind">Kind</Label>
                  <Input
                    id="kind"
                    value={formData.kind}
                    onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                    placeholder="e.g., Apartment, Office"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="objective">Objective (Optional)</Label>
                <Input
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="e.g., Income generation, Capital appreciation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whyThisProject">Why This Project</Label>
                <textarea
                  id="whyThisProject"
                  className="w-full rounded-md border border-gray-800 bg-background px-3 py-2 min-h-[100px]"
                  value={formData.whyThisProject}
                  onChange={(e) => setFormData({ ...formData, whyThisProject: e.target.value })}
                  placeholder="Why this project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whyThisSponsor">Why This Sponsor</Label>
                <textarea
                  id="whyThisSponsor"
                  className="w-full rounded-md border border-gray-800 bg-background px-3 py-2 min-h-[100px]"
                  value={formData.whyThisSponsor}
                  onChange={(e) => setFormData({ ...formData, whyThisSponsor: e.target.value })}
                  placeholder="Why this sponsor"
                />
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Processing..." : isCreateMode ? "Create Property" : "Update Property"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No properties found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property?._id || 'unknown'} className="overflow-hidden">
                  {property?.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={property.image}
                        alt={property?.title || 'Property'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{property?.title || 'N/A'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Min Investment:</span>
                      <span className="text-white">${(property?.minimumInvestment ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">ROI:</span>
                      <span className="text-primary">{(property?.roi ?? 0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Strategy:</span>
                      <span className="text-white">{property?.strategy || 'N/A'}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
