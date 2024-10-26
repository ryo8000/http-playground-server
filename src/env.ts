export class EnvConfig {
  public static readonly ORIGIN = process.env['ORIGIN'] || '*';
  public static readonly PORT = Number(process.env['PORT']) || 8000;
}
