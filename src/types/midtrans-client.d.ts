declare module 'midtrans-client' {
  export interface SnapOptions {
    isProduction: boolean
    serverKey: string
    clientKey: string
  }

  export interface TransactionParameter {
    transaction_details: {
      order_id: string
      gross_amount: number
    }
    customer_details?: {
      first_name: string
      last_name?: string
      email?: string
      phone?: string
    }
    item_details?: Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>
    callbacks?: {
      finish?: string
      error?: string
      pending?: string
    }
  }

  export interface TransactionResponse {
    token: string
    redirect_url: string
  }

  export class Snap {
    constructor(options: SnapOptions)
    createTransaction(parameter: TransactionParameter): Promise<TransactionResponse>
  }
}