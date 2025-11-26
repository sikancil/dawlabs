export class Create{{className}}Dto {
  name: string;
  description?: string;
  data?: Record<string, unknown>;
  tags?: string[];

  constructor() {
    this.name = '';
    this.description = '';
    this.data = {};
    this.tags = [];
  }
}