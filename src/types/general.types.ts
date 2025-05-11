import { ICloudinaryFile, ICloudinaryIMage } from "../interfaces";

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Keys extends keyof T 
    ? { [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>> } 
    : never;

export type RequireAtLeastOneResult<T, Keys extends keyof T = keyof T> = 
  RequireAtLeastOne<T, Keys> extends infer O 
    ? { [K in keyof O]: O[K] } 
    : never;



export type RequiredMediaAsset = {
    file?: ICloudinaryFile;
    image?: ICloudinaryIMage;
} & ({ file: ICloudinaryFile } | { image: ICloudinaryIMage });