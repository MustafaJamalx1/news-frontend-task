export interface SchemaItem {
  id: string | number;
  slug: string;
  name?: {
    ar?: string;
    en?: string;
    kr?: string;
  };
  description?: {
    ar?: string;
    en?: string;
    kr?: string;
  };
  type?: string;
  component?: string;
  colsNumber?: string | number;
  value?: any;
  isRequired?: boolean;
  header?: {
    ar?: string;
    en?: string;
    kr?: string;
  };
  images?: any[];
  files?: any[];
  contents?: any[];
}

export interface TagItem {
  title: string;
  value: string;
}

export interface ApiResponse {
  items: Array<{
    schema: string;
    [key: string]: any;
  }>;
}

export interface FormSubmissionPayload {
  categories: Array<{ categoryId: string }>;
  contentStatusId: string;
  contentTypeId: number;
  dynamicContentLanguages: Array<{
    language: string;
    title: string;
    description: string;
    content: string;
    tags: Array<{ tagId: string }>;
    formData: Record<string, any>;
  }>;
  expiryDate: string | null;
  isFeature: boolean;
  isSticky: boolean;
  publishDate: string;
  slug: string;
}