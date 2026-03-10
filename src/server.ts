import app from "./app";


function bootstrap() {
  // Start the server
  app.listen(4000, () => {
    console.log(`Server is running on http://localhost:${4000}`);
  });
}

bootstrap();