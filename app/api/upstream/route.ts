export async function GET() {
  const opened = Date.now();
  let timer: ReturnType<typeof setInterval>;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("first\n"));
      timer = setInterval(() => controller.enqueue(new TextEncoder().encode("tick\n")), 1000);
    },
    cancel() {
      clearInterval(timer);
      console.log(`upstream closed after ${Date.now() - opened}ms`);
    },
  });
  return new Response(body);
}
