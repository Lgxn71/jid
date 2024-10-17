import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Sun } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

const registerTeamSchema = z.object({
  teamName: z.string().min(1).max(50),
  companySize: z.string(),
  logo: z.any().optional(),
});

export default function Page() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { ...form } = useForm<z.infer<typeof registerTeamSchema>>({
    resolver: zodResolver(registerTeamSchema),
    defaultValues: {
      teamName: "",
      companySize: "",
      logo: null,
    },
  });
  console.log(!form.formState.isValid);

  function onSubmit(values: z.infer<typeof registerTeamSchema>) {
    const formData = new FormData();
    formData.append("teamName", values.teamName);
    formData.append("companySize", values.companySize);
    if (values.logo) {
      formData.append("logo", values.logo);
    } else {
      formData.append("logo", values.teamName.charAt(0).toUpperCase());
    }

    console.log([...formData]);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="max-w-[500px] flex-1 p-8 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-6">Tell us about your team</h1>
        <p className="text-sm text-gray-400 mb-1">Step 1 of 4</p>
        <div className="w-16 h-1 bg-purple-600 mb-6"></div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="teamName">Company or team name</FormLabel>

                  <FormControl>
                    <Input
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Ex: Acme Marketing or Acme Co"
                      id="teamName"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    This will be the name of your organization{" "}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="companySize">
                    Company size (optional)
                  </FormLabel>

                  <FormControl>
                    <Input
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Example: 100"
                      id="companySize"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    We will need this to help choose a plan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="logo">Add team Logo</FormLabel>

                  <FormControl>
                    <div className="flex gap-[20px] items-center">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-200 text-purple-800 flex items-center justify-center text-2xl font-bold rounded">
                          {form.getValues("teamName").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <Input
                        type="file"
                        id="logo"
                        className="w-auto bg-gray-800 border-gray-700 text-white"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          console.log(file); // Log the selected file

                          if (file) {
                            field.onChange(file); // Pass the file to the form's onChange handler
                            setPreviewImage(URL.createObjectURL(file)); // Set the preview URL
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={!form.formState.isValid}
              type="submit"
            >
              {!form.formState.isValid}
              Submit
            </Button>
          </form>
        </Form>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center">
        <Card className="w-[500px] h-[500px] shadow-none border-none bg-purple-600 rounded-3xl p-4 relative overflow-hidden">
          <div className="flex justify-end space-x-1 mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <Sun className="text-yellow-600 w-10 h-10" />
          </div>

          <div className="bg-white/20 w-full h-6 rounded mb-2"></div>
          <div className="bg-white/20 w-3/4 h-6 rounded mb-4"></div>
          <div className="bg-white/10 w-full h-24 rounded"></div>

          <div className="p-[10px]"></div>

          <div className="bg-white/20 w-full h-6 rounded mb-2"></div>
          <div className="bg-white/20 w-3/4 h-6 rounded mb-4"></div>
          <div className="bg-white/10 w-full h-24 rounded"></div>
        </Card>
      </div>
    </div>
  );
}
