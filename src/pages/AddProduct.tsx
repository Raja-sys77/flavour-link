import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { name, description, price, category } = form;

    const { data, error } = await supabase.from("products").insert([
      {
        name,
        description,
        price: parseFloat(price),
        category,
      },
    ]);

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Product added!" });
      navigate("/products");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Add a New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="price">Price (in ₹)</Label>
          <Input type="number" name="price" value={form.price} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input name="category" value={form.category} onChange={handleChange} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
}
