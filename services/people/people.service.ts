// services/people/people.service.ts
import { PEOPLE_ENDPOINTS } from '@/endpoints/people.endpoints';
import { httpClient } from '@/services/core/http.service';
import { ListPeopleParams, PaginatedResponse, Person, CreatePersonPayload, UpdatePersonPayload } from '@/types';


export const peopleService = {
  async list(
    params: ListPeopleParams = {},
  ): Promise<PaginatedResponse<Person>> {
    const { data } = await httpClient.get<PaginatedResponse<Person>>(
      PEOPLE_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Person> {
    const { data } = await httpClient.get<Person>(PEOPLE_ENDPOINTS.detail(id));
    return data;
  },

  async create(payload: CreatePersonPayload): Promise<Person> {
    const { data } = await httpClient.post<Person>(
      PEOPLE_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async update(id: string, payload: UpdatePersonPayload): Promise<Person> {
    const { data } = await httpClient.patch<Person>(
      PEOPLE_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      PEOPLE_ENDPOINTS.remove(id),
    );
    return data;
  },

  async restore(id: string): Promise<Person> {
    const { data } = await httpClient.patch<Person>(
      PEOPLE_ENDPOINTS.restore(id),
    );
    return data;
  },

  async hardDelete(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      PEOPLE_ENDPOINTS.hardDelete(id),
    );
    return data;
  },
};