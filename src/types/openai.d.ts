declare module 'openai' {
  export class OpenAI {
    constructor(options: {
      apiKey: string;
      dangerouslyAllowBrowser?: boolean;
    });
    
    chat: {
      completions: {
        create: (options: any) => Promise<{
          choices: Array<{
            message: {
              content: string | null;
            };
          }>;
        }>;
      };
    };
  }
} 