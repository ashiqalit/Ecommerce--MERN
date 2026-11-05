import { api } from "./client";
import type { Address } from "../types";

export interface AddressInput {
  fullName: string;
  phone: string;
  place: string;
  city: string;
  state: string;
  pincode: string;
}

export async function fetchAddresses() {
  const res = await api.get<{ data: { addresses: Address[] } }>("/addresses");
  return res.data.data.addresses;
}

export async function createAddressRequest(input: AddressInput) {
  const res = await api.post<{ data: { address: Address } }>(
    "/addresses",
    input,
  );
  return res.data.data.address;
}
