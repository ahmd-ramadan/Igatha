import { ApiError, generateUniqueString, INTERNAL_SERVER_ERROR } from '../utils';
import { productService } from './product.service';

export class SlugifyService {

    private readonly slugOptions = {
        replacement: '-',    
        lower: true,         
        strict: true,        
        locale: 'en'
    }

    async generateSlug(text: string, to: 'product') {
        try {
            // let newSlug = slug(text, this.slugOptions);
            let newSlug = text.trim().split(' ').join('-');

            let isExist = false;
            if (to === 'product') {
                isExist = await productService.findProductBySlug(newSlug) ? true : false;
            }
            if (isExist) {
                newSlug += `-${generateUniqueString({ length: 3, type: 'numbers' })}`;
            }
            return newSlug;  
        } catch(error) {
            console.log(error)
            throw new ApiError(
                'Something wen wrong while generating slug',
                INTERNAL_SERVER_ERROR,
            );
        }
    }
}

export const slugService = new SlugifyService();