"use client"
import { useEffect, useRef } from 'react'
import cytoscape, { ElementsDefinition } from 'cytoscape'

type Node = { id?: string; path?: string; label?: string; layer?: string }
type Edge = { id?: string; from?: string; to?: string; from_path?: string; to_path?: string; edge_type?: string }

export default function GraphView({ nodes, edges, violations }: { nodes: Node[]; edges: Edge[]; violations?: { details?: string }[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const parseDetails = (d?: string) => {
      if (!d) return null
      // Match either unicode arrow (\u2192) or ASCII '->'
      const m = d.match(/(.+)\s*(?:\u2192|->)\s*(.+)/)
      return m ? { from: m[1].trim(), to: m[2].trim() } : null
    }

    const vSet = new Set<string>()
    for (const v of violations || []) {
      const p = parseDetails(v.details)
      if (p) vSet.add(`${p.from}__${p.to}`)
    }

    const nmap = new Map<string, string>()
    const els: ElementsDefinition = { nodes: [], edges: [] }

    for (const n of nodes || []) {
      const id = n.id || n.path || n.label || Math.random().toString(36).slice(2)
      const label = n.label || n.path || id
      // map common keys so edges can resolve
      nmap.set(label, id)
      if (n.path) nmap.set(n.path, id)
      if (n.id) nmap.set(n.id, id)
      els.nodes!.push({ data: { id, label, layer: n.layer || '' } })
    }

    for (const e of edges || []) {
      const from = e.from || e.from_path || ''
      const to = e.to || e.to_path || ''
      if (!from || !to) continue
      const sid = nmap.get(from) || nmap.get(e.from_path || '') || nmap.get(e.from || '') || from
      const tid = nmap.get(to) || nmap.get(e.to_path || '') || nmap.get(e.to || '') || to
      const key = `${from}__${to}`
      const isViolation = vSet.has(key)
      els.edges!.push({ data: { id: `${sid}->${tid}`, source: sid, target: tid, violation: isViolation ? 1 : 0 } })
    }

    let cy = cyRef.current
    if (!cy) {
      cy = cytoscape({
        container: containerRef.current,
        elements: els,
        style: [
          { selector: 'node', style: { 'background-color': '#6b7280', label: 'data(label)', color: '#e5e7eb', 'font-size': 10 } },
          { selector: 'edge', style: { width: 1.5, 'line-color': '#475569', 'target-arrow-color': '#475569', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
          { selector: 'edge[violation] ', style: { width: 2.5, 'line-color': '#ef4444', 'target-arrow-color': '#ef4444' } },
        ],
        layout: { name: 'cose', animate: false },
      })
      cyRef.current = cy
    } else {
      cy.startBatch();
      cy.elements().remove();
      cy.add(els as any);
      cy.endBatch();
    }

    cy.layout({ name: 'cose', animate: false }).run()

  }, [nodes, edges, violations])

  // Destroy Cytoscape on component unmount only
  useEffect(() => {
    return () => {
      try { cyRef.current?.destroy() } catch {}
      cyRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ height: 420, width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
}

