import { VistaEditorProvider, VistaImagePicker, VistaContactCategory, VistaStepNavigation } from "../../../../contracts/VistaEditor";
import { vistaStepForField } from "../../../../contracts/vista-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { useTranslation } from "@/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import type { Product } from "../../../../contracts/commerce";
import type { Page } from "../../../../contracts/customers";
import {
  displayVistaValue,
  type PublicationState,
  type VistaMetadata,
  type VistaRecord,
  type VistaStatus,
} from "../../../../contracts/vista";
import {
  Editor,
  LoadState,
  Pager,
  Panel,
  Records,
  Status,
  errorMessage,
  options,
  useLoad,
  useWorkspace,
} from "./shared";

import { VistaFields } from "./VistaFields";
import {
  initialVistaValues,
  selectVistaCategory,
  vistaSubcategories,
  publicationValues,
  vistaAllocatedTotal,
  type VistaValues,
} from "../../../../contracts/vista-form";
export default function Vista() {
  const { request, can, shop } = useWorkspace();
  const { t, tOr, translateError, translateMessage, formatDateTime, formatNumber } =
    useTranslation();
  const q = useLoad<VistaStatus>("/integrations/vista", 10000);
  const c = q.data?.data.connection;
  const [kind, setKind] = useState("products");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<VistaRecord | null>(null);
  const [review, setReview] = useState<VistaRecord | null>(null);
  const [batch, setBatch] = useState<number | null>(null);
  const rows = useLoad<Page<VistaRecord>>(
    "/integrations/vista/records/" +
      kind +
      "?" +
      new URLSearchParams({ page: String(page), search }),
    10000,
  );
  async function action(name: string) {
    setBusy(true);
    setError("");
    try {
      await request("/integrations/vista/" + name, {
        method: "POST",
        body: "{}",
      });
      await q.reload();
      await rows.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const columns =
    kind === "products"
      ? [
          "name",
          "sku",
          "price",
          "currency",
          "stock_quantity",
          "stock_status",
          "visible",
        ]
      : kind === "orders"
        ? ["order_number", "customer_id", "status", "total", "currency"]
        : ["name", "email", "phone"];
  return (
    <>
      <Panel title="vista.connectionTitle">
        <LoadState {...q} />
        {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
        {!q.data?.data.enabled ? (
          <p>{t("vista.notConfigured")}</p>
        ) : c ? (
          <>
            <p>
              <strong>{c.store_name}</strong> ·{" "}
              {t("vista.vistaStore", { id: c.store_id })} ·{" "}
              <Status value={c.status} />
            </p>
            <p>
              {t("vista.autoSync", {
                when: c.synced_at
                  ? formatDateTime(c.synced_at)
                  : t("vista.never"),
                expiry: formatDateTime(c.expires_at),
              })}
            </p>
            {q.data?.data.processing?.worker_active === false && <Alert variant="warning">{t("vista.workerUnavailable")}</Alert>}
            {!c.synced_at && <p role="status">{t("vista.initialSync")}</p>}
            {c.last_error && (
              <Alert variant="warning">{translateError(c.last_error)}</Alert>
            )}
            {can("integrations.write") && (
              <div className="d-flex gap-2">
                <Button
                  disabled={
                    busy ||
                    c.status === "disconnected" ||
                    c.status === "syncing"
                  }
                  onClick={() => void action("sync")}
                >
                  {t("vista.syncData")}
                </Button>
                <Button
                  variant="outline-danger"
                  disabled={busy || c.status === "disconnected"}
                  onClick={() => {
                    if (window.confirm(t("vista.disconnectConfirm")))
                      void action("disconnect");
                  }}
                >
                  {t("vista.disconnect")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p>{t("vista.authorizeOwner")}</p>
        )}
        <p className="mt-3 text-muted">{t("vista.sourceIdentity")}</p>
      </Panel>
      <Panel title="vista.recordsTitle">
        <div className="d-flex gap-2 mb-3">
          {options(["products", "orders", "customers"], "vista.kind")
            .filter((k) =>
              can(
                k.value === "products"
                  ? "products.read"
                  : k.value === "orders"
                    ? "orders.read"
                    : "customers.read",
              ),
            )
            .map((k) => (
              <Button
                key={k.value}
                variant={kind === k.value ? "primary" : "outline-primary"}
                onClick={() => {
                  setKind(k.value);
                  setPage(1);
                }}
              >
                {t(k.label)}
              </Button>
            ))}
        </div>
        <Form.Control
          className="mb-3"
          aria-label={t("vista.searchRecords")}
          placeholder={t("vista.searchRecords")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <LoadState {...rows} />
        <Records
          headers={[
            "vista.colVistaId",
            ...options(columns, "vista.field").map((o) => o.label),
            "vista.actions",
          ]}
          empty={!rows.data?.data.length}
        >
          {rows.data?.data.map((r) => (
            <tr key={r.id}>
              <td>{r.remote_id}</td>
              {columns.map((k) => (
                <td key={k}>{displayVistaValue(r.payload[k])}</td>
              ))}
              <td>
                <Button size="sm" variant="link" onClick={() => setDetail(r)}>
                  {t("vista.details")}
                </Button>
                {kind === "customers" &&
                  can("imports.write") &&
                  can("customers.write") && (
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => setReview(r)}
                    >
                      {t("vista.reviewCustomerImport")}
                    </Button>
                  )}
              </td>
            </tr>
          ))}
        </Records>
        <Pager page={page} last={rows.data?.last_page} setPage={setPage} />
      </Panel>
      {batch && (
        <Alert variant="success">
          {t("vista.previewCreated", { id: formatNumber(batch) })}{" "}
          <Link to={"/workspace/imports?shop=" + shop.id}>
            {t("vista.openImports", { label: t("menu.imports") })}
          </Link>
          {t("vista.reviewDuplicatesHint")}
        </Alert>
      )}
      {review && (
        <Editor
          title="vista.reviewTitle"
          fields={[
            {
              key: "first_name",
              label: "vista.firstName",
              required: true,
              maxLength: 100,
            },
            {
              key: "last_name",
              label: "vista.lastName",
              required: true,
              maxLength: 100,
            },
          ]}
          help={t("vista.reviewHelp", {
            name: displayVistaValue(review.payload.name),
          })}
          close={() => setReview(null)}
          onSave={async (v) => {
            const r = await request<{ data: { id: number } }>(
              "/integrations/vista/customer-imports",
              {
                method: "POST",
                body: JSON.stringify({ rows: [{ id: review.id, ...v }] }),
              },
            );
            setBatch(r.data.id);
          }}
        />
      )}
      <Modal show={!!detail} onHide={() => setDetail(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {t("vista.viewTitle", {
              kind: detail?.kind ?? "",
              remoteId: detail?.remote_id ?? "",
            })}
          </Modal.Title>
          <LanguageToggle variant="inline" className="ms-auto me-2" />
        </Modal.Header>
        <Modal.Body>
          <p>
            {detail
              ? t("vista.observedAt", {
                  when: formatDateTime(detail.observed_at),
                })
              : ""}
          </p>
          <dl>
            {Object.entries(detail?.payload ?? {}).map(([k, v]) => (
              <div className="mb-3" key={k}>
                <dt>{tOr("vista.field." + k, k.replaceAll("_", " "))}</dt>
                <dd className="text-break">{displayVistaValue(v)}</dd>
              </div>
            ))}
          </dl>
        </Modal.Body>
      </Modal>
    </>
  );
}
export function VistaProduct({
  product,
  refresh,
}: {
  product: Product;
  refresh: () => Promise<void>;
}) {
  const { request, can, prefix } = useWorkspace();
  const { t, translateError, translateMessage, formatNumber } =
    useTranslation();
  const c = useLoad<VistaStatus>("/integrations/vista");
  const q = useLoad<PublicationState>(
    "/products/" + product.id + "/vista",
    5000,
  );
  const [meta, setMeta] = useState<VistaMetadata | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [key, setKey] = useState(crypto.randomUUID());
  const [values, setValues] = useState<VistaValues>({});
  const [quantity, setQuantity] = useState(0);
  const [step, setStep] = useState(0);
  const contact = values.product_type === "contact_lens";
  const pub = q.data?.data;
  const remoteId = pub?.remote_id ?? null;
  const allocated = vistaAllocatedTotal(values);
  const pending = q.data?.operations.some((o) =>
    ["pending", "processing", "uncertain"].includes(o.status),
  );
  const allowed =
    can("integrations.publish") && can("products.write") && can("stock.write");
  async function action(path: string) {
    setBusy(true);
    setError("");
    try {
      await request(path, { method: "POST", body: "{}" });
      await q.reload();
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (!c.data?.data.enabled) return null;
  return (
    <Panel title="vista.publicationTitle">
      {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
      {!c.data.data.connection ||
      c.data.data.connection.status === "disconnected" ? (
        <p>{t("vista.connectFirst")}</p>
      ) : (
        <>
          <p>
            {c.data.data.connection.store_name} ·{" "}
            {remoteId
              ? t("vista.publishedProduct", { id: remoteId })
              : t("vista.notPublished")}{" "}
            ·{" "}
            {remoteId
              ? pub?.visible
                ? t("vista.visible")
                : t("vista.notVisible")
              : ""}
          </p>
          <p>
            {t("vista.availableStock", {
              available: formatNumber(product.balance.available),
            })}
          </p>
          {allowed && (
            <div className="d-flex gap-2 mb-3">
              <Button
                disabled={
                  busy ||
                  pending ||
                  product.status !== "active" ||
                  product.currency !== "EUR"
                }
                onClick={() => {
                  setBusy(true);
                  setError("");
                  setKey(crypto.randomUUID());
                  void request<VistaMetadata>("/integrations/vista/metadata")
                    .then((m) => {
                      if (m.data.schema_version !== 3)
                        throw new Error("vista.schemaVersion");
                      setValues(initialVistaValues(product, pub?.mapping));
                      setQuantity(0); setStep(0);
                      setMeta(m);
                    })
                    .catch((e) => setError(errorMessage(e)))
                    .finally(() => setBusy(false));
                }}
              >
                {remoteId
                  ? t("vista.updateOrAllocate")
                  : t("vista.uploadToVista")}
              </Button>
              {remoteId && (
                <Button
                  variant="outline-primary"
                  disabled={busy || pending}
                  onClick={() =>
                    void action("/products/" + product.id + "/vista/refresh")
                  }
                >
                  {t("vista.refreshPublication")}
                </Button>
              )}
            </div>
          )}
          <Records
            headers={[
              "vista.thOperation",
              "vista.thStatus",
              "vista.thAllocated",
              "vista.thResult",
            ]}
            empty={!q.data?.operations.length}
          >
            {q.data?.operations.map((o) => (
              <tr key={o.id}>
                <td>#{formatNumber(o.id)}</td>
                <td>
                  <Status value={o.status} />
                </td>
                <td>
                  {formatNumber(o.allocated_quantity)} / {formatNumber(o.attempts)}
                </td>
                <td>
                  {o.last_error && translateError(o.last_error)}
                  {allowed && ["pending", "uncertain"].includes(o.status) && (
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void action(
                            "/integrations/vista/operations/" + o.id + "/retry",
                          )
                        }
                      >
                        {t("vista.retry")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(t("vista.cancelConfirm")))
                            void action(
                              "/integrations/vista/operations/" +
                                o.id +
                                "/cancel",
                            );
                        }}
                      >
                        {t("vista.cancelPublication")}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Records>
        </>
      )}
      <Modal show={!!meta} onHide={() => setMeta(null)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{t("vista.publishTitle")}</Modal.Title>
          <LanguageToggle variant="inline" className="ms-auto me-2" />
        </Modal.Header>
        <Modal.Body>
          {meta && (
            <VistaEditorProvider product={product} values={values} meta={meta} theme="admin" request={request} imageBase={"/api/v1" + prefix} refresh={() => void refresh()} t={t}>
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                try {
                  await request("/products/" + product.id + "/vista", {
                    method: "POST",
                    body: JSON.stringify({
                      version: product.version,
                      quantity,
                      creation_key: key,
                      expected_version: pub?.remote_version,
                      mapping: publicationValues(meta, values),
                    }),
                  });
                  setMeta(null);
                  await q.reload();
                  await refresh();
                } catch (e) {
                  setError(errorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <p>{meta.data.publication_policy}</p>
              <p>{t("vista.photoOrderNote")}</p>
              <Form.Group className="mb-3" controlId="vista-category">
                <Form.Label>{t("vista.categoryLabel")}</Form.Label>
                <Form.Select
                  required
                  value={String(values.category_id ?? "")}
                  onChange={(e) =>
                    { setValues(selectVistaCategory(values, e.target.value, meta)); setStep(0); }
                  }
                >
                  <option value="">{t("vista.selectPlaceholder")}</option>
                  {meta.data.categories
                    .filter((c) => c.parent_id === null && c.product_type)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
              <p>
                {t("vista.productType", {
                  type: String(values.product_type ?? "").replaceAll("_", " "),
                })}
              </p>
              {contact && step === 0 && <VistaContactCategory values={values} onChange={setValues} />}
              {!contact && vistaSubcategories(meta, values.category_id).length > 0 && (
                <Form.Group controlId="vista-subcategory">
                  <Form.Label>{t("vista.subcategoryLabel")}</Form.Label>
                  <Form.Select
                    value={String(values.sub_category_id ?? "")}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        sub_category_id: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  >
                    <option value="">{t("vista.selectPlaceholder")}</option>
                    {vistaSubcategories(meta, values.category_id).map(
                      ([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ),
                    )}
                  </Form.Select>
                </Form.Group>
              )}
              {contact && <VistaStepNavigation step={step} onChange={setStep} />}
              {(!contact || step === 0) && <>
              <VistaFields
                fields={meta.data.common_fields ?? []}
                values={values}
                onChange={setValues}
              />
              <Form.Group className="my-3" controlId="vista-quantity">
                <Form.Label>{t("vista.quantityLabel")}</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={product.balance.available}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </Form.Group>
              <VistaImagePicker label={t("ops.vista.photos")} value={values.gallery_image_ids} onChange={v => setValues({ ...values, gallery_image_ids: v })} />
              </>}
              <VistaFields
                fields={
                  meta.data.categories.find(
                    (c) => c.id === Number(values.category_id),
                  )?.fields?.filter(f => !contact || vistaStepForField(f.key) === step) ?? []
                }
                values={values}
                onChange={setValues}
              />
              {allocated !== null && (
                <p>
                  {t("vista.optionAllocationTotal", {
                    total: formatNumber(allocated),
                    quantity: formatNumber(quantity),
                  })}
                </p>
              )}
              {error && (
                <Alert variant="danger">{translateMessage(error)}</Alert>
              )}
              <Button
                type="submit"
                className="mt-3"
                disabled={
                  busy || (contact && step !== 2) || product.images?.some(i => i.scan_status === "pending" && !i.archived_at) || !values.category_id || (allocated !== null && allocated !== quantity)
                }
              >
                {t("vista.publishBtn")}
              </Button>
            </Form>
            </VistaEditorProvider>
          )}
        </Modal.Body>
      </Modal>
    </Panel>
  );
}
