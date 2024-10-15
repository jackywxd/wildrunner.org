import { httpStatusText } from "@/lib/utils/http-status-codes";

export class ApiError extends Error {
  constructor(status: number, message?: string) {
    super();
    this.name = this.constructor.name;
    this.message = message ?? httpStatusText(status);
  }
}
