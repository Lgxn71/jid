import { createContext } from "react";
import type { Project } from "@prisma/client";

export const ProjContext = createContext<Project[]>([]);
