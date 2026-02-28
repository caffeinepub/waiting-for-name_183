/**
 * Type augmentation for the backend module.
 *
 * Adds _initializeAccessControlWithSecret to both backendInterface and Backend
 * so that the platform-generated useActor.ts compiles cleanly.
 *
 * The method is declared on the Backend class via declaration merging.
 * A runtime stub is installed in backend-shim.ts so the method exists at runtime.
 */
import type {} from "./backend";

declare module "./backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(token: string): Promise<void>;
  }

  interface Backend {
    _initializeAccessControlWithSecret(token: string): Promise<void>;
  }
}
