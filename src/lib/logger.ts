// Definição dos níveis de log possíveis
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Interface estruturada para entrada de log
interface LogEntry {
  level: LogLevel; // Nível de severidade
  message: string; // Mensagem principal
  data?: any; // Dados adicionais opcionais
  timestamp: string; // Momento do log
}

// Classe Logger implementando padrão Singleton
class Logger {
  private static instance: Logger; // Instância única
  private isProduction: boolean; // Flag de ambiente

  // Construtor privado para evitar instanciação direta
  private constructor() {
    this.isProduction = import.meta.env.PROD;
  }

  // Método estático para obter a instância única
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Método interno genérico de log
  private log(level: LogLevel, message: string, data?: any) {
    // Cria a entrada de log estruturada
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Lógica de envio/exibição
    // Em produção, logs de erro são críticos. Em dev, mostramos tudo.
    if (!this.isProduction || level === 'error') {
      const consoleMethod = level === 'info' ? 'log' : level;
      // Formatação no console
      console[consoleMethod](
        `[${entry.timestamp}] [${level.toUpperCase()}]: ${message}`,
        data || ''
      );
    }
    // TODO: Adicionar integração com serviço de monitoramento (Sentry/LogRocket) aqui
  }

  // Atalho para logs informativos
  public info(message: string, data?: any) {
    this.log('info', message, data);
  }

  // Atalho para avisos
  public warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  // Atalho para erros
  public error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Atalho para debug (apenas dev)
  public debug(message: string, data?: any) {
    if (!this.isProduction) {
      this.log('debug', message, data);
    }
  }
}

// Exporta a instância pronta para uso
export const logger = Logger.getInstance();
