import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TipTap from "~/components/ui/rich-text/tiptap";
import { Button } from "~/components/ui/button";

function DemoText() {
  const textSchema = z.object({
    description: z.string().min(1).max(500),
  });

  const form = useForm<z.infer<typeof textSchema>>({
    resolver: zodResolver(textSchema),
    mode: "onChange",
    defaultValues: {
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof textSchema>) {}

  return (
    <main>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TipTap onChange={field.onChange} description={field.value} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </main>
  );
}

export default DemoText;
