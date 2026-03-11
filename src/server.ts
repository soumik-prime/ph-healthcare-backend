import app from "./app";
import { envVars } from "./app/config/env";

function bootstrap() {
  // Start the server
  try {
    app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Faild to start server: ", error);
    process.exit(1);
  }
}

bootstrap();