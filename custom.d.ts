// This is required to load SVG files into typescript
// https://stackoverflow.com/questions/44717164/unable-to-import-svg-files-in-typescript
declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content as string;
}
