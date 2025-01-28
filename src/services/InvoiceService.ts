"use server";
import { auth } from "@/auth";
import { ENV } from "@/constants";
import { Pageable } from "@/dtos/base";
import { InvoiceDTO, InvoiceStatusConstants } from "@/dtos/invoice/InvoiceDTO";
import { InvoiceRequest } from "@/dtos/invoice/InvoiceRequest";
import { ApiResponse } from "@/types";

export const getAllInvoiceByStudent = async (
  studentCode: string
): Promise<ApiResponse<InvoiceDTO[]>> => {
  const requestId = `${crypto.randomUUID()}`;
  const session = await auth();
  if (!session?.token || !session.user?.email) {
    return {
      status: 401,
      message: "Unauthorized",
    };
  }
  try {
    const response = await fetch(
      `${ENV.API_URL}/api/invoice/${requestId}/${studentCode}/student`,
      {
        method: "GET",
        headers: {
          "x-access-token": session.token.accessToken,
        },
      }
    );
    if (response.status !== 200) {
      return {
        status: response.status,
        message: response.statusText,
      };
    }

    const data: InvoiceDTO[] = (await response.json()) as InvoiceDTO[];
    return {
      status: response.status,
      message: response.statusText,
      data,
    };
  } catch (e) {
    console.log(e);
    return { message: "Failed to fetch", status: 500 };
  }
};

export const updateInvoice = async (
  invoiceRequest: InvoiceRequest
): Promise<ApiResponse<InvoiceDTO>> => {
  const requestId = `${crypto.randomUUID()}`;
  const session = await auth();
  if (!session?.token || !session.user?.email) {
    return {
      status: 401,
      message: "Unauthorized",
    };
  }
  try {
    const response = await fetch(`${ENV.API_URL}/api/invoice/${requestId}`, {
      method: "PUT",
      headers: {
        "x-access-token": session.token.accessToken,
        "content-type": "application/json",
      },
      body: JSON.stringify(invoiceRequest),
    });
    console.log(response);
    if (response.status !== 200) {
      return {
        status: response.status,
        message: response.statusText,
      };
    }

    const data: InvoiceDTO = (await response.json()) as InvoiceDTO;
    return {
      status: response.status,
      message: response.statusText,
      data,
    };
  } catch (e) {
    console.log(e);
    return { message: "Failed to fetch", status: 500 };
  }
};

export const getInvoiceById = async (
  invoiceId: number
): Promise<ApiResponse<InvoiceDTO>> => {
  console.log(invoiceId);
  const requestId = `${crypto.randomUUID()}`;
  const session = await auth();
  if (!session?.token || !session.user?.email) {
    return {
      status: 401,
      message: "Unauthorized",
    };
  }
  try {
    const response = await fetch(
      `${ENV.API_URL}/api/invoice/${requestId}/${invoiceId}`,
      {
        method: "GET",
        headers: {
          "x-access-token": session.token.accessToken,
        },
      }
    );
    if (response.status !== 200) {
      return {
        status: response.status,
        message: response.statusText,
      };
    }

    const data: InvoiceDTO = (await response.json()) as InvoiceDTO;
    return {
      status: response.status,
      message: response.statusText,
      data,
    };
  } catch (e) {
    console.log(e);
    return { message: "Failed to fetch", status: 500 };
  }
};

export const getAllInvoice = async (
  page: number,
  size: number,
  sort: string[] = [],
  searchString?: string,
  filter?: InvoiceStatusConstants[]
): Promise<ApiResponse<Pageable<InvoiceDTO>>> => {
  const requestId = `${crypto.randomUUID()}`;
  const session = await auth();
  if (!session?.token || !session.user?.email) {
    return {
      status: 401,
      message: "Unauthorized",
    };
  }
  try {
    const response = await fetch(
      `${
        ENV.API_URL
      }/api/invoice/${requestId}?page=${page}&size=${size}&sort=${sort}${
        searchString ? `&searchString=${searchString}` : ""
      }&filter=${filter}`,
      {
        method: "GET",
        headers: {
          "x-access-token": session.token.accessToken,
        },
      }
    );
    if (response.status !== 200) {
      return {
        status: response.status,
        message: response.statusText,
      };
    }

    const data: Pageable<InvoiceDTO> =
      (await response.json()) as Pageable<InvoiceDTO>;
    return {
      status: response.status,
      message: response.statusText,
      data,
    };
  } catch (e) {
    console.log(e);
    return { message: "Failed to fetch", status: 500 };
  }
};
