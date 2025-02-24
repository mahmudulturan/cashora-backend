import { PopulateOptions } from "mongoose";

export const getPopulateFields = (query: Record<string, unknown>): { populate: PopulateOptions[], exceptFields: string[], fields: string } => {
    const exceptFields: string[] = [];
    const fields: string = query.fields ? (query.fields as string).split(',').join(' ') : '';

    // get populate fields
    const populate: PopulateOptions[] = (query?.populate as string)?.split(',')?.map(path => {
        exceptFields.push(path);

        // if nested populate query found
        if (path.includes('.')) {
            const [mainPath, subPath] = path?.split('.');

            const mainPopulateFields = query[`${mainPath}Fields`] as string;
            mainPopulateFields !== undefined && exceptFields.push(`${mainPath}Fields`);

            const subPopulateFields = query[`${subPath}Fields`] as string;
            subPopulateFields !== undefined && exceptFields.push(`${subPath}Fields`);

            return { path: mainPath, select: mainPopulateFields?.split(','), populate: { path: subPath, select: subPopulateFields?.split(',') } };
        }

        const populateFields = query[`${path}Fields`] as string;

        populateFields !== undefined && exceptFields.push(`${path}Fields`);

        return { path, select: populateFields?.split(',') };
    });

    return { populate, exceptFields, fields }
}