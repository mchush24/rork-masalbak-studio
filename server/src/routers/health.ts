import { procedure, router } from "../trpc";

export const healthRouter = router({
  ping: procedure.query(() => {
    return {
      status: "ok",
      message: "MasalBak tRPC backend çalışıyor 🚀"
    };
  })
});
