export const messagesShape = (params: string[]) => {
  return {
    url: new URL(`/api/shape-proxy`, "https://site.localhost").href,
    params: {
      table: '"Message"',
       where: `ARRAY["projectId"]::text[] <@ ARRAY[${params.map(param => `'${param}'`).join(",")}]::text[]`
    }
  };
};
