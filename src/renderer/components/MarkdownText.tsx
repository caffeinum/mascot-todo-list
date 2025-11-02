type MarkdownTextProps = {
  content: string
}

export function MarkdownText({ content }: MarkdownTextProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    
    return lines.map((line, i) => {
      // handle bold **text**
      let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      
      // handle italic *text*
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>')
      
      // handle lists - lines starting with - or *
      if (/^[\-\*]\s/.test(line)) {
        processed = processed.replace(/^[\-\*]\s/, '• ')
        return (
          <div key={i} style={{ marginLeft: '8px' }}>
            <span dangerouslySetInnerHTML={{ __html: processed }} />
          </div>
        )
      }
      
      return (
        <div key={i}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
        </div>
      )
    })
  }
  
  return <div>{renderMarkdown(content)}</div>
}
