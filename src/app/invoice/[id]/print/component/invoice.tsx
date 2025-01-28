import { InvoiceDTO } from "@/dtos/invoice/InvoiceDTO";
import { DateToStringWithoutTime } from "@/utils/DateUtils";
import VNnum2words from 'vn-num2words';

type InvoiceProps = {
    invoice: InvoiceDTO;
    check: boolean;
}

export default function Invoice({invoice, check}: Readonly<InvoiceProps>) {
  return (
    <div className="bg-white w-[297mm] h-[200mm] mx-auto p-4 border border-gray-300 shadow-md text-sm overflow-hidden">
      <header className="text-center mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-12 mr-4" />
          </div>
          <div className="text-center">
            <p className="font-semibold mb-1">
              TRUNG TÂM NGOẠI NGỮ TRÍ VIỆT - CƠ SỞ 2
            </p>
            <p>Hoàng Diệu, Phường Trảng Bàng, TX Trảng Bàng, Tây Ninh</p>
          </div>
          <div className="text-right">
            <p>Tve-ims</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-4">PHIẾU THU</h1>
      </header>

      <section className="mb-4 max-h-[50mm] overflow-hidden">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p>
              Họ tên học viên:{" "}
              <span className="font-semibold">{invoice.studentName} ({invoice.studentNickName})</span>
            </p>
            <p>
              Điện thoại: <span className="font-semibold">{invoice.studentPhoneNumber}</span>
            </p>
            <p>
              Họ tên người thu tiền:{" "}
              <span className="font-semibold">{invoice.staffName}</span>
            </p>
          </div>
          <div className="text-left">
            <p>Liên 1: {check ? `Giao cho PH` : `Người lập giữ`}</p>
            <p>Quyển số:</p>
            <p>Số HD:</p>
          </div>
          <div className="text-left">
            <p>Số HV: {invoice.studentCode}</p>
            <p>Số PT: {invoice.id}</p>
            <p>Ngày thu: {DateToStringWithoutTime(new Date())}</p>
            <p>Lần thu: 1</p>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <table className="table-auto w-full border-collapse border border-black text-center mb-4">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1">STT</th>
            <th className="border border-black px-2 py-1">Nội dung thu</th>
            <th className="border border-black px-2 py-1">ĐVT</th>
            <th className="border border-black px-2 py-1">SL</th>
            <th className="border border-black px-2 py-1">Mức thu (VND)</th>
            <th className="border border-black px-2 py-1">Miễn giảm</th>
            <th className="border border-black px-2 py-1">Thành tiền (VND)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1">1</td>
            <td className="border border-black px-2 py-1">
              {invoice.className}
            </td>
            <td className="border border-black px-2 py-1">Khóa</td>
            <td className="border border-black px-2 py-1">1</td>
            <td className="border border-black px-2 py-1">{invoice.tuitionOwed}</td>
            <td className="border border-black px-2 py-1">{invoice.invoiceDiscount}</td>
            <td className="border border-black px-2 py-1">{invoice.tuitionOwed}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={5}
              rowSpan={4}
              className="border border-black px-2 py-1 text-left align-top"
            >
              <p>
                <span className="font-semibold">Thực thu:</span> {invoice.amount} đ
              </p>
              <p>
                <span className="font-semibold">Viết bằng chữ:</span> {VNnum2words(invoice.amount)} đồng
              </p>
            </td>
            <td className="border border-black px-2 py-1 text-right font-semibold">
              Tổng tiền:
            </td>
            <td className="border border-black px-2 py-1">{invoice.amount}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 text-right font-semibold">
              Thanh toán:
            </td>
            <td className="border border-black px-2 py-1">{invoice.amount}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 text-right font-semibold">
              Còn lại:
            </td>
            <td className="border border-black px-2 py-1">0</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Section */}
      <footer>
        <p className="mb-4">Ghi chú:</p>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-base font-bold">Người nộp tiền</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold">Thủ quỹ</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold">Người lập phiếu</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
