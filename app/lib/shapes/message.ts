export const messagesShape = (params: string[]) => {
  return {
    url: new URL(
      `/api/shape-proxy`,
      import.meta.env.VITE_APP_URL
    ).href,
    params: {
      table: '"Message"',
      where: `ARRAY["projectId"]::text[] <@ ARRAY[${params
        .map(param => `'${param}'`)
        .join(',')}]::text[]`
    }
  };
};
