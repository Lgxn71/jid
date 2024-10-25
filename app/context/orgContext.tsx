import { createContext } from "react";
import type { Organization } from "@prisma/client";

export const OrgContext = createContext<Organization[]>([]);
