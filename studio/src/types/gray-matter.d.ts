declare module "gray-matter" {
  interface GrayMatterFile<I extends string> {
    data: { [key: string]: any };
    content: string;
    excerpt?: string;
    orig: I;
    language: string;
    materiel: string;
    isEmpty: boolean;
    stringify(): string;
  }
  function matter<I extends string>(input: I, options?: any): GrayMatterFile<I>;
  export = matter;
}
