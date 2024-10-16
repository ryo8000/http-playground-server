export class EnvConfig {
  public static readonly PORT = Number(process.env['PORT']) || 8000;
}
