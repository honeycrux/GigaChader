import { Prisma, PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient();

type FilterFunction<SelectedT, ResponseT> = (data: SelectedT) => Promise<ResponseT>;

type SampleFunction<ResponseT, K extends Record<string, any> = any> = (props: K) => Promise<ResponseT | null>;

/* Class for each standard response type */
export class StandardizedQuery<SelectT, PrismaResultT, ResponseT> {
    select: SelectT;
    filter: FilterFunction<PrismaResultT, ResponseT>;
    sample: SampleFunction<ResponseT>;

    constructor(props: { select: SelectT; filter: FilterFunction<PrismaResultT, ResponseT>; sample: SampleFunction<ResponseT> }) {
        this.select = props.select;
        this.filter = props.filter;
        this.sample = props.sample;
    }
}
